import { Injectable } from '@nestjs/common';
import { applyRules } from './recommendation.rules';
import { Recommendation } from './interfaces/recommendation.interface';
import { LessonsService } from '../lessons/providers/lessons.service';

@Injectable()
export class RecommendationService {
  constructor(private readonly lessonService: LessonsService) {}

  async getNextCourses(userId: string): Promise<Recommendation[]> {
    const lessonHistory = await this.lessonService.getLessonProgress(userId);

    return applyRules(lessonHistory);
  }
}
