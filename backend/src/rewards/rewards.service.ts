import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BADGE_MILESTONES, MilestoneRule } from './badge-milestones';
import { User } from 'src/users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import {
  RewardHistory,
  XpRewardReason,
} from './entities/reward-history.entity';
import { UserBadge } from './entities/user-badge.entity';

export const XP_LESSON_COMPLETE = 10;
export const XP_QUIZ_PASS = 25;
export const XP_COURSE_COMPLETE = 100;

const REASON_LABELS: Record<XpRewardReason, string> = {
  [XpRewardReason.LESSON_COMPLETE]: 'Completed a lesson',
  [XpRewardReason.QUIZ_PASS]: 'Passed a quiz',
  [XpRewardReason.COURSE_COMPLETE]: 'Completed a course',
  [XpRewardReason.STREAK_MILESTONE]: 'Streak milestone',
};

@Injectable()
export class RewardsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RewardHistory)
    private readonly rewardHistoryRepository: Repository<RewardHistory>,
  ) {}

  async awardXP(
    userId: string,
    amount: number,
    reason: XpRewardReason,
  ): Promise<{ xp: number; earnedBadges: Badge[] }> {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        return;
      }

      const currentXp = Math.max(
        Number(user.xp ?? 0),
        Number(user.points ?? 0),
      );
      const nextXp = currentXp + amount;
      user.xp = nextXp;
      user.points = nextXp;

      if (reason === XpRewardReason.LESSON_COMPLETE) {
        user.lessonsCompleted = Number(user.lessonsCompleted ?? 0) + 1;
      }
      if (reason === XpRewardReason.COURSE_COMPLETE) {
        user.coursesCompleted = Number(user.coursesCompleted ?? 0) + 1;
      }

      await manager.save(User, user);
      const historyRepository = manager.getRepository(RewardHistory);
      await historyRepository.save(
        historyRepository.create({ userId, amount, reason }),
      );
    });

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['xp'],
    });
    const earnedBadges = await this.checkAndAwardBadges(userId);

    return { xp: Number(user.xp ?? 0), earnedBadges };
  }

  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const [user, badges, earnedBadges] = await Promise.all([
      this.userRepository.findOneOrFail({ where: { id: userId } }),
      this.badgeRepository.find(),
      this.userBadgeRepository.find({
        where: { userId },
        relations: { badge: true },
      }),
    ]);
    const earnedKeys = new Set(earnedBadges.map((entry) => entry.badge?.key));
    const newlyEarned: Badge[] = [];

    for (const milestone of BADGE_MILESTONES) {
      if (earnedKeys.has(milestone.key)) {
        continue;
      }

      const badge = badges.find((candidate) => candidate.key === milestone.key);
      if (
        !badge ||
        !(await this.isMilestoneMet(user, milestone.rule, userId))
      ) {
        continue;
      }

      await this.userBadgeRepository.save(
        this.userBadgeRepository.create({ userId, badgeId: badge.id }),
      );
      newlyEarned.push(badge);
    }

    return newlyEarned;
  }

  async getMyRewards(userId: string): Promise<{
    xp: number;
    badges: UserBadge[];
    recentHistory: Array<{
      amount: number;
      reason: XpRewardReason;
      label: string;
      createdAt: Date;
    }>;
  }> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['xp'],
    });
    const [badges, history] = await Promise.all([
      this.getEarnedBadges(userId),
      this.rewardHistoryRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 50,
      }),
    ]);

    return {
      xp: Number(user.xp ?? 0),
      badges,
      recentHistory: history.map((entry) => ({
        amount: entry.amount,
        reason: entry.reason,
        label: REASON_LABELS[entry.reason] ?? entry.reason,
        createdAt: entry.createdAt,
      })),
    };
  }

  async getLeaderboard(): Promise<
    Array<{
      rank: number;
      username: string | null;
      xp: number;
      badgesCount: number;
    }>
  > {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'name', 'xp'],
      order: { xp: 'DESC' },
      take: 10,
    });
    const badgeCounts = await this.userBadgeRepository
      .createQueryBuilder('userBadge')
      .select('userBadge.userId', 'userId')
      .addSelect('COUNT(userBadge.id)', 'count')
      .groupBy('userBadge.userId')
      .getRawMany();
    const countsByUser = new Map(
      badgeCounts.map((row) => [row.userId, Number(row.count) || 0]),
    );

    return users.map((user, index) => ({
      rank: index + 1,
      username: user.username ?? user.name ?? null,
      xp: Number(user.xp ?? 0),
      badgesCount: countsByUser.get(user.id) ?? 0,
    }));
  }

  async getEarnedBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.find({
      where: { userId },
      relations: { badge: true },
      order: { awardedAt: 'ASC' },
    });
  }

  getBadgeMilestones() {
    return BADGE_MILESTONES;
  }

  private async isMilestoneMet(
    user: User,
    rule: MilestoneRule,
    userId: string,
  ): Promise<boolean> {
    switch (rule.kind) {
      case 'xp':
        return Number(user.xp ?? 0) >= rule.min;
      case 'lessons':
        return Number(user.lessonsCompleted ?? 0) >= rule.min;
      case 'courses':
        return Number(user.coursesCompleted ?? 0) >= rule.min;
      case 'quiz_passes': {
        const quizPasses = await this.rewardHistoryRepository.count({
          where: { userId, reason: XpRewardReason.QUIZ_PASS },
        });
        return quizPasses >= rule.min;
      }
    }
  }
}
