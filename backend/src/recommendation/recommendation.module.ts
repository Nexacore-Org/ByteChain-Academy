import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [LessonsModule],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
