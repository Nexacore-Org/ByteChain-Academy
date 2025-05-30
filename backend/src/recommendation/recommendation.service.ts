import { Injectable } from '@nestjs/common';
import { applyRules } from './recommendation.rules';
import { Recommendation } from './interfaces/recommendation.interface';
import { LessonsService } from '../lessons/providers/lessons.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { ProgressTrackingService } from '../progress/progress.service';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly lessonService: LessonsService,
    private readonly quizService: QuizzesService,
    private readonly userCourseProgressService: ProgressTrackingService,
  ) {}

  async getNextCourses(
    userId: number,
    courseId: number,
  ): Promise<Recommendation[]> {
    const lessonHistory = await this.lessonService.getLessonProgress(userId);
    const quizResults = this.quizService.findAll(userId);
    const courseProgress =
      await this.userCourseProgressService.getStudentProgress(userId, courseId);

    return applyRules(lessonHistory, quizResults, courseProgress);
  }
}
