// Analytics controller skeleton
import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

// DTOs
class LessonStartDto {
  lessonId: number;
}
class LessonEndDto {
  lessonId: number;
}
class QuizScoreDto {
  lessonId: number;
  quizId: number;
  score: number;
  attempt: number;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('lesson-start')
  async lessonStart(@Request() req, @Body() dto: LessonStartDto) {
    return this.analyticsService.startLesson(req.user.id, dto.lessonId);
  }

  @Post('lesson-end')
  async lessonEnd(@Request() req, @Body() dto: LessonEndDto) {
    return this.analyticsService.endLesson(req.user.id, dto.lessonId);
  }

  @Post('quiz-score')
  async quizScore(@Request() req, @Body() dto: QuizScoreDto) {
    return this.analyticsService.recordQuizScore(
      req.user.id,
      dto.lessonId,
      dto.quizId,
      dto.score,
      dto.attempt,
    );
  }

  @Get('user/:userId')
  async getUserAnalytics(@Param('userId') userId: number) {
    return this.analyticsService.getUserAnalytics(userId);
  }
}
