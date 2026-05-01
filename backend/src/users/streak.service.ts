import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from './entities/user.entity';
import { RewardsService } from '../rewards/rewards.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { XpRewardReason } from '../rewards/entities/reward-history.entity';

@Injectable()
export class StreakService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rewardsService: RewardsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Updates the user's streak based on activity.
   * - If lastActiveAt was yesterday, increment streak.
   * - If lastActiveAt was more than 1 day ago, reset streak to 1.
   * - If lastActiveAt is today, do nothing.
   * - Update longestStreak if current streak exceeds it.
   * - Check for milestones and award bonuses.
   */
  async updateStreak(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak || 0;
    let shouldUpdateLastActiveAt = true;

    if (user.lastActiveAt) {
      const lastActiveDate = new Date(user.lastActiveAt);
      const lastActiveDay = new Date(
        lastActiveDate.getFullYear(),
        lastActiveDate.getMonth(),
        lastActiveDate.getDate(),
      );

      if (lastActiveDay.getTime() === today.getTime()) {
        // Already active today, no change
        shouldUpdateLastActiveAt = false;
      } else if (lastActiveDay.getTime() === yesterday.getTime()) {
        // Active yesterday, increment streak
        newStreak += 1;
      } else {
        // Gap in activity, reset to 1
        newStreak = 1;
      }
    } else {
      // First activity, start streak at 1
      newStreak = 1;
    }

    // Update longestStreak if needed
    if (newStreak > (user.longestStreak || 0)) {
      user.longestStreak = newStreak;
    }

    user.streak = newStreak;

    if (shouldUpdateLastActiveAt) {
      user.lastActiveAt = now;
    }

    await this.userRepository.save(user);

    // Check for streak milestones
    await this.checkStreakMilestones(userId, newStreak);
  }

  /**
   * Checks if the current streak hits a milestone and awards bonus XP and notification.
   */
  private async checkStreakMilestones(
    userId: string,
    streak: number,
  ): Promise<void> {
    const milestones = [
      { days: 3, xp: 15 },
      { days: 7, xp: 50 },
      { days: 14, xp: 100 },
      { days: 30, xp: 200 },
    ];

    const milestone = milestones.find((m) => m.days === streak);
    if (milestone) {
      await this.rewardsService.awardXP(
        userId,
        milestone.xp,
        XpRewardReason.STREAK_MILESTONE,
      );
      await this.notificationsService.createNotification(
        userId,
        NotificationType.STREAK_MILESTONE,
        `Congratulations! You've reached a ${streak}-day learning streak and earned ${milestone.xp} bonus XP!`,
      );
    }
  }

  /**
   * Daily cron job to reset streaks for users inactive for more than 48 hours.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetInactiveStreaks(): Promise<void> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 48);

    const usersToReset = await this.userRepository
      .createQueryBuilder('user')
      .where('user.streak > 0')
      .andWhere('user.lastActiveAt < :cutoff OR user.lastActiveAt IS NULL', {
        cutoff,
      })
      .getMany();

    for (const user of usersToReset) {
      user.streak = 0;
      await this.userRepository.save(user);
    }
  }
}
