import { Module } from '@nestjs/common';
import { LessonQuizResultsService } from './providers/lesson-quiz-results.service';

@Module({
  providers: [LessonQuizResultsService]
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonQuizResult } from './entities/lesson-quiz-result.entity';
import { Student } from 'src/student/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonQuizResult, Student])],
  controllers: [],
  providers: [LessonQuizResultsService],
  exports: [LessonQuizResultsService],
})
export class LessonQuizResultModule {}
