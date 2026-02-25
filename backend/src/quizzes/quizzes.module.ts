import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Question } from '../quizzes/entities/question.entity';
import { QuizSubmission } from '../quizzes/entities/quiz-submission.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Lesson, QuizSubmission]),
    PassportModule,
    AuthModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
