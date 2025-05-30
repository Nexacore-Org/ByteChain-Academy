import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptsService } from './quiz-attempt.services';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizQuestion, QuizAttempt])],
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizAttemptsService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
