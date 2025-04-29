import { Module } from '@nestjs/common';
import { LessonQuizResultsService } from './providers/lesson-quiz-results.service';

@Module({
  providers: [LessonQuizResultsService]
})
export class LessonQuizResultModule {}
