import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateService } from '../certificates/certificates.service';
import { Progress } from './entities/progress.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { NotificationType } from '../notifications/entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { RewardsService } from '../rewards/rewards.service';
import {
  XP_COURSE_COMPLETE,
  XP_LESSON_COMPLETE,
} from '../rewards/rewards.service';
import { XpRewardReason } from '../rewards/entities/reward-history.entity';
import { StreakService } from '../users/streak.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WebhookEvent } from '../webhooks/dto/create-webhook.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly certificateService: CertificateService,
    private readonly notificationsService: NotificationsService,
    private readonly rewardsService: RewardsService,
    private readonly streakService: StreakService,
    private readonly webhooksService: WebhooksService,
  ) {}

  /**
   * Marks a lesson as completed for the user. Creates a progress record if none exists (find-or-create).
   * Triggers certificate auto-issuance when all lessons in the course are completed.
   */
  async completeLesson(userId: string, courseId: string, lessonId: string) {
    const alreadyCompleted = await this.progressRepository.findOne({
      where: { userId, lessonId, completed: true },
      select: ['id'],
    });

    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId },
      relations: ['user', 'lesson', 'course'],
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        courseId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        user: { id: userId },
        course: { id: courseId },
        lesson: { id: lessonId },
      });
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await this.progressRepository.save(progress);

    if (!alreadyCompleted) {
      await this.rewardsService.awardXP(
        userId,
        XP_LESSON_COMPLETE,
        XpRewardReason.LESSON_COMPLETE,
      );
      await this.notificationsService.createNotification(
        userId,
        NotificationType.LESSON_COMPLETE,
        'You completed a lesson.',
        `/courses/${courseId}/lessons/${lessonId}`,
      );
      await this.streakService.updateStreak(userId);
    }

    const allLessonsCompleted = await this.checkAllLessonsCompleted(
      userId,
      courseId,
    );

    if (allLessonsCompleted) {
      if (!alreadyCompleted) {
        await this.rewardsService.awardXP(
          userId,
          XP_COURSE_COMPLETE,
          XpRewardReason.COURSE_COMPLETE,
        );
        await this.notificationsService.createNotification(
          userId,
          NotificationType.COURSE_COMPLETE,
          'You completed a course.',
          `/courses/${courseId}`,
        );

        // Dispatch webhook event
        await this.webhooksService.dispatchEvent(
          WebhookEvent.COURSE_COMPLETED,
          {
            userId,
            courseId,
            completedAt: new Date(),
          },
        );
      }
      await this.certificateService.issueCertificateForCourse(userId, courseId);
    }

    return progress;
  }

  /**
   * Returns the authenticated user's progress for a specific course (list of lesson completion statuses).
   */
  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<
    { lessonId: string; completed: boolean; completedAt: Date | null }[]
  > {
    const progressList = await this.progressRepository.find({
      where: { userId, courseId },
      relations: ['lesson'],
    });

    progressList.sort(
      (a, b) => (a.lesson?.order ?? 0) - (b.lesson?.order ?? 0),
    );

    return progressList.map((p) => ({
      lessonId: p.lessonId,
      completed: p.completed,
      completedAt: p.completedAt,
    }));
  }

  /**
   * Checks if user has completed all lessons in a course (for certificate auto-issuance).
   */
  private async checkAllLessonsCompleted(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const totalLessons = await this.lessonRepository.count({
      where: { courseId },
    });

    if (totalLessons === 0) return false;

    const completedCount = await this.progressRepository.count({
      where: { userId, courseId, completed: true },
    });

    return completedCount >= totalLessons;
  }
}
