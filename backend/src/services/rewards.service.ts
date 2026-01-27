import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { User } from '../entities/user.entity';
import { BADGE_MILESTONES } from '../modules/rewards/badge-milestones';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Badge) private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async ensureBadgeCatalog(): Promise<void> {
    // Keep DB badge metadata aligned with code-defined milestones.
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
  }): Promise<{
    progress: { lessonsCompleted: number; coursesCompleted: number };
    newlyAwarded: Badge[];
  }> {
    const lessonsDelta = args.lessonsCompletedDelta ?? 0;
    const coursesDelta = args.coursesCompletedDelta ?? 0;

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

    const newlyAwarded = await this.awardEligibleBadges(args.userId);

    const user = await this.userRepository.findOneOrFail({
      where: { id: args.userId },
      select: ['id', 'lessonsCompleted', 'coursesCompleted'],
    });

    return {
      progress: {
        lessonsCompleted: user.lessonsCompleted,
        coursesCompleted: user.coursesCompleted,
      },
      newlyAwarded,
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
      } catch {
        // Duplicate protection: unique constraint on (userId, badgeId) makes this safe.
      }
    }

    return newlyAwarded;
  }
}
