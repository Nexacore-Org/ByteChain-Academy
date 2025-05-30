// Analytics service skeleton
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonAnalytics } from './entities/lesson_analytics.entity';
import { QuizAnalytics } from './entities/quiz_analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(LessonAnalytics)
    private lessonAnalyticsRepo: Repository<LessonAnalytics>,
    @InjectRepository(QuizAnalytics)
    private quizAnalyticsRepo: Repository<QuizAnalytics>,
  ) {}

  async startLesson(userId: number, lessonId: number): Promise<LessonAnalytics> {
    const record = this.lessonAnalyticsRepo.create({
      userId,
      lessonId,
      lessonStartTime: new Date(),
    });
    return this.lessonAnalyticsRepo.save(record);
  }

  async endLesson(userId: number, lessonId: number): Promise<LessonAnalytics> {
    const record = await this.lessonAnalyticsRepo.findOne({
      where: { userId, lessonId },
      order: { lessonStartTime: 'DESC' },
    });
    if (!record) throw new Error('Lesson start not found');
    record.lessonEndTime = new Date();
    record.durationSeconds = Math.floor((record.lessonEndTime.getTime() - record.lessonStartTime.getTime()) / 1000);
    return this.lessonAnalyticsRepo.save(record);
  }

  async recordQuizScore(userId: number, lessonId: number, quizId: number, score: number, attempt: number): Promise<QuizAnalytics> {
    const record = this.quizAnalyticsRepo.create({
      userId,
      lessonId,
      quizId,
      score,
      attempt,
    });
    return this.quizAnalyticsRepo.save(record);
  }

  async getUserAnalytics(userId: number) {
    const lessons = await this.lessonAnalyticsRepo.find({ where: { userId } });
    const quizzes = await this.quizAnalyticsRepo.find({ where: { userId } });
    return { lessons, quizzes };
  }
}
