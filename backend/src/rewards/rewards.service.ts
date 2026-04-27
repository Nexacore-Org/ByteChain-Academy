import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BADGE_MILESTONES, MilestoneRule } from './badge-milestones';
import { User } from '../users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import {
  RewardHistory,
  XpRewardReason,
} from './entities/reward-history.entity';
import { UserBadge } from './entities/user-badge.entity';
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
      recentHistory: history.map((h) => ({
        amount: h.amount,
        reason: h.reason,
        label: RewardsService.REASON_LABELS[h.reason] ?? h.reason,
        createdAt: h.createdAt,
      })),
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
