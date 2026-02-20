import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CertificateService } from 'src/certificates/certificates.service';
import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    private readonly certificateService: CertificateService, // <--- injected
  ) {}

  /**
   * Marks a lesson/course as completed
   */
  async completeLesson(userId: string, courseId: string, lessonId: string) {
    // Mark lesson progress as completed (existing logic)
    const progress = await this.progressRepository.findOne({
      where: { user: { id: userId }, lesson: { id: lessonId } },
    });

    if (!progress) throw new Error('Progress record not found');

    progress.completed = true;
    await this.progressRepository.save(progress);

    // Check if all lessons for the course are completed
    const allLessonsCompleted = await this.checkAllLessonsCompleted(
      userId,
      courseId,
    );

    if (allLessonsCompleted) {
      // Issue certificate automatically
      await this.certificateService.issueCertificateForCourse(userId, courseId);
    }

    return progress;
  }

  /**
   * Checks if user has completed all lessons in a course
   */
  private async checkAllLessonsCompleted(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const lessons = await this.progressRepository.find({
      where: { user: { id: userId }, lesson: { course: { id: courseId } } },
    });

    return lessons.every((l) => l.completed);
  }
}
