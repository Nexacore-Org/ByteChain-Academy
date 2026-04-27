import { Injectable, NotFoundException } from '@nestjs/common';
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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WebhookEvent } from '../webhooks/dto/create-webhook.dto';

export const XP_LESSON_COMPLETE = 10;
export const XP_QUIZ_PASS = 25;

/** Human-readable labels for XP reward reasons. */
const REASON_LABELS: Record<XpRewardReason, string> = {
  [XpRewardReason.LESSON_COMPLETE]: 'Completed a lesson',
  [XpRewardReason.QUIZ_PASS]: 'Passed a quiz',
  [XpRewardReason.COURSE_COMPLETE]: 'Completed a course',
  [XpRewardReason.STREAK_MILESTONE]: 'Streak milestone bonus',
};
export const XP_COURSE_COMPLETE = 100;

function meetsMilestoneRule(
  user: Pick<User, 'xp' | 'lessonsCompleted' | 'coursesCompleted'>,
  rule: MilestoneRule,
  quizPassCount: number,
): boolean {
  switch (rule.kind) {
    case 'xp':
      return user.xp >= rule.min;
    case 'lessons':
      return user.lessonsCompleted >= rule.min;
    case 'courses':
      return user.coursesCompleted >= rule.min;
    case 'quiz_passes':
      return quizPassCount >= rule.min;
    default:
      return false;
  }
}

@Injectable()
export class RewardsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Badge) private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RewardHistory)
    private rewardHistoryRepository: Repository<RewardHistory>,
    private readonly notificationsService: NotificationsService,
    private readonly webhooksService: WebhooksService,
  ) {}

  async ensureBadgeCatalog(): Promise<void> {
    for (const milestone of BADGE_MILESTONES) {
      const xpThreshold = milestone.rule.kind === 'xp' ? milestone.rule.min : 0;

      const existing = await this.badgeRepository.findOne({
        where: { key: milestone.key },
      });
      if (!existing) {
        await this.badgeRepository.save(
          this.badgeRepository.create({
            key: milestone.key,
            name: milestone.name,
            description: milestone.description,
            xpThreshold,
            iconUrl: milestone.iconUrl,
          }),
        );
        continue;
      }

      const next = {
        name: milestone.name,
        description: milestone.description,
        xpThreshold,
        iconUrl: milestone.iconUrl,
      };

      const needsUpdate =
        existing.name !== next.name ||
        existing.description !== next.description ||
        existing.xpThreshold !== next.xpThreshold ||
        (existing.iconUrl ?? null) !== (next.iconUrl ?? null);

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

  /**
   * Increments user XP (and legacy `points` for existing stats/rank queries),
   * records {@link RewardHistory}, then evaluates milestone badges.
   */
  async awardXP(
    userId: string,
    amount: number,
    reason: XpRewardReason,
  ): Promise<{ xp: number; newlyAwardedBadges: Badge[] }> {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const baseXp = (user.xp ?? 0) > 0 ? user.xp : (user.points ?? 0);
      const nextXp = baseXp + amount;
      user.xp = nextXp;
      user.points = nextXp;

      if (reason === XpRewardReason.LESSON_COMPLETE) {
        user.lessonsCompleted = (user.lessonsCompleted ?? 0) + 1;
      }
      if (reason === XpRewardReason.COURSE_COMPLETE) {
        user.coursesCompleted = (user.coursesCompleted ?? 0) + 1;
      }

      await manager.save(User, user);

      await manager.getRepository(RewardHistory).save(
        manager.getRepository(RewardHistory).create({
          userId,
          amount,
          reason,
        }),
      );
    });

    const newlyAwardedBadges = await this.checkAndAwardBadges(userId);
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['xp'],
    });

    return { xp: user.xp, newlyAwardedBadges };
  }

  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    await this.ensureBadgeCatalog();

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['id', 'xp', 'lessonsCompleted', 'coursesCompleted'],
    });

    const quizPassCount = await this.rewardHistoryRepository.count({
      where: { userId, reason: XpRewardReason.QUIZ_PASS },
    });

    const allBadges = await this.badgeRepository.find({
      where: BADGE_MILESTONES.map((m) => ({ key: m.key })),
    });

    const milestonesByKey = new Map(BADGE_MILESTONES.map((m) => [m.key, m]));

    const earned = await this.userBadgeRepository.find({
      where: { userId },
      relations: { badge: true },
    });
    const earnedIds = new Set(earned.map((ub) => ub.badgeId));

    const eligible = allBadges.filter((b) => {
      if (earnedIds.has(b.id)) return false;
      const milestone = milestonesByKey.get(b.key);
      if (!milestone) return false;
      return meetsMilestoneRule(user, milestone.rule, quizPassCount);
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
        await this.notificationsService.createNotification(
          userId,
          NotificationType.BADGE_EARNED,
          `You earned a new badge: ${badge.name}.`,
          '/rewards',
        );
        
        // Dispatch webhook event
        await this.webhooksService.dispatchEvent(WebhookEvent.BADGE_EARNED, {
          userId,
          badgeId: badge.id,
          badgeName: badge.name,
          awardedAt: new Date(),
        });
      } catch {
        // Unique constraint race: ignore
      }
    }

    return newlyAwarded;
  }

  async getMyRewards(userId: string): Promise<{
    xp: number;
    badges: Array<{ badge: Badge; awardedAt: Date }>;
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

    const [badges, rawHistory] = await Promise.all([
      this.getEarnedBadges(userId),
      this.rewardHistoryRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 50,
      }),
    ]);

    const recentHistory = rawHistory.map((h) => ({
      amount: h.amount,
      reason: h.reason,
      label: REASON_LABELS[h.reason] ?? h.reason,
      createdAt: h.createdAt,
    }));

    return {
      xp: user.xp,
      badges,
      recentHistory,
    };
  }

  async getLeaderboard(): Promise<
    Array<{ rank: number; username: string | null; xp: number; badgesCount: number }>
  > {
    const rows = await this.userRepository
      .createQueryBuilder('user')
      .select('user.username', 'username')
      .addSelect('user.name', 'name')
      .addSelect('COALESCE(user.xp, 0)', 'xp')
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(ub.id)')
            .from('user_badges', 'ub')
            .where('ub."userId" = user.id'),
        'badgesCount',
      )
      .orderBy('"xp"', 'DESC')
      .limit(10)
      .getRawMany();

    return rows.map((r, i) => ({
      rank: i + 1,
      username: r.username ?? r.name ?? null,
      xp: Number(r.xp) || 0,
      badgesCount: Number(r.badgesCount) || 0,
    }));
  }
}
