import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BADGE_MILESTONES } from './badge-milestones';
import { User } from 'src/users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import { RewardHistory } from './entities/reward-history.entity';
import { UserBadge } from './entities/user-badge.entity';

@Injectable()
export class RewardsService {
  private readonly POINTS_PER_LESSON = 10;
  private readonly POINTS_PER_COURSE = 50;

  constructor(
    @InjectRepository(Badge) private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RewardHistory)
    private rewardHistoryRepository: Repository<RewardHistory>,
  ) {}

  async ensureBadgeCatalog(): Promise<void> {
    for (const milestone of BADGE_MILESTONES) {
      const existing = await this.badgeRepository.findOne({
        where: { key: milestone.key },
      });
      if (!existing) {
        await this.badgeRepository.save(
          this.badgeRepository.create({
            key: milestone.key,
            name: milestone.name,
            description: milestone.description,
            icon: milestone.icon,
          }),
        );
        continue;
      }

      const next = {
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
      };

      const needsUpdate =
        existing.name !== next.name ||
        existing.description !== next.description ||
        (existing.icon ?? null) !== (next.icon ?? null);

      if (needsUpdate) {
        await this.badgeRepository.update({ id: existing.id }, next);
      }
    }
  }

  async getBadgeMilestones(): Promise<Badge[]> {
    await this.ensureBadgeCatalog();
    return this.badgeRepository.find({
      where: BADGE_MILESTONES.map((m) => ({ key: m.key })),
      order: { name: 'ASC' },
    });
  }

  async getEarnedBadges(
    userId: string,
  ): Promise<Array<{ badge: Badge; awardedAt: Date }>> {
    const earned = await this.userBadgeRepository.find({
      where: { userId },
      relations: { badge: true },
      order: { awardedAt: 'ASC' },
    });

    return earned.map((ub) => ({ badge: ub.badge, awardedAt: ub.awardedAt }));
  }

  async updateProgressAndAwardBadges(args: {
    userId: string;
    lessonsCompletedDelta?: number;
    coursesCompletedDelta?: number;
    activityId?: string;
    activityType?: 'lesson' | 'course';
  }): Promise<{
    progress: {
      lessonsCompleted: number;
      coursesCompleted: number;
      points: number;
    };
    newlyAwarded: Badge[];
    pointsEarned: number;
  }> {
    let lessonsDelta = args.lessonsCompletedDelta ?? 0;
    let coursesDelta = args.coursesCompletedDelta ?? 0;
    let pointsToAdd = 0;

    if (args.activityId && args.activityType) {
      const existingReward = await this.rewardHistoryRepository.findOne({
        where: {
          userId: args.userId,
          activityType: args.activityType,
          activityId: args.activityId,
        },
      });

      if (!existingReward) {
        if (args.activityType === 'lesson') {
          pointsToAdd = this.POINTS_PER_LESSON;

          if (lessonsDelta === 0) lessonsDelta = 1;
        } else if (args.activityType === 'course') {
          pointsToAdd = this.POINTS_PER_COURSE;

          if (coursesDelta === 0) coursesDelta = 1;
        }

        await this.rewardHistoryRepository.save(
          this.rewardHistoryRepository.create({
            userId: args.userId,
            activityType: args.activityType,
            activityId: args.activityId,
            points: pointsToAdd,
          }),
        );
      } else {
        lessonsDelta = 0;
        coursesDelta = 0;
        pointsToAdd = 0;
      }
    } else {
      if (lessonsDelta > 0)
        pointsToAdd += lessonsDelta * this.POINTS_PER_LESSON;
      if (coursesDelta > 0)
        pointsToAdd += coursesDelta * this.POINTS_PER_COURSE;
    }

    if (lessonsDelta > 0 || coursesDelta > 0 || pointsToAdd > 0) {
      if (lessonsDelta > 0) {
        await this.userRepository.increment(
          { id: args.userId },
          'lessonsCompleted',
          lessonsDelta,
        );
      }
      if (coursesDelta > 0) {
        await this.userRepository.increment(
          { id: args.userId },
          'coursesCompleted',
          coursesDelta,
        );
      }
      if (pointsToAdd > 0) {
        await this.userRepository.increment(
          { id: args.userId },
          'points',
          pointsToAdd,
        );
      }
    }

    const newlyAwarded = await this.awardEligibleBadges(args.userId);

    const user = await this.userRepository.findOneOrFail({
      where: { id: args.userId },
      select: ['id', 'lessonsCompleted', 'coursesCompleted', 'points'],
    });

    return {
      progress: {
        lessonsCompleted: user.lessonsCompleted,
        coursesCompleted: user.coursesCompleted,
        points: user.points,
      },
      newlyAwarded,
      pointsEarned: pointsToAdd,
    };
  }

  async awardEligibleBadges(userId: string): Promise<Badge[]> {
    await this.ensureBadgeCatalog();

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['id', 'lessonsCompleted', 'coursesCompleted'],
    });

    const milestonesByKey = new Map(BADGE_MILESTONES.map((m) => [m.key, m]));
    const allBadges = await this.badgeRepository.find({
      where: BADGE_MILESTONES.map((m) => ({ key: m.key })),
    });

    const earned = await this.userBadgeRepository.find({
      where: { userId },
      relations: { badge: true },
    });
    const earnedKeys = new Set(earned.map((ub) => ub.badge.key));

    const eligible = allBadges.filter((badge) => {
      if (earnedKeys.has(badge.key)) return false;
      const milestone = milestonesByKey.get(badge.key);
      if (!milestone) return false;

      if (milestone.type === 'lessons_completed')
        return user.lessonsCompleted >= milestone.threshold;
      if (milestone.type === 'courses_completed')
        return user.coursesCompleted >= milestone.threshold;
      return false;
    });

    const newlyAwarded: Badge[] = [];

    for (const badge of eligible) {
      try {
        await this.userBadgeRepository.save(
          this.userBadgeRepository.create({
            userId,
            badgeId: badge.id,
          }),
        );
        newlyAwarded.push(badge);
      } catch (err) {
        console.log('error', err);
      }
    }

    return newlyAwarded;
  }
}
