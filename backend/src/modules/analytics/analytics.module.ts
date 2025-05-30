// Analytics module definition
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { LessonAnalytics } from './entities/lesson_analytics.entity';
import { QuizAnalytics } from './entities/quiz_analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonAnalytics, QuizAnalytics])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
