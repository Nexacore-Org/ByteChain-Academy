import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CertificateService } from 'src/certificates/certificates.service';
import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly certificateService: CertificateService,
  ) {}

  /**
   * Marks a lesson as completed for the user. Creates a progress record if none exists (find-or-create).
   * Triggers certificate auto-issuance when all lessons in the course are completed.
   */
  async completeLesson(userId: string, courseId: string, lessonId: string) {
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

    const allLessonsCompleted = await this.checkAllLessonsCompleted(
      userId,
      courseId,
    );

    if (allLessonsCompleted) {
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
  ): Promise<{ lessonId: string; completed: boolean; completedAt: Date | null }[]> {
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
