import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Question } from '../quizzes/entities/question.entity';
import { QuizSubmission } from '../quizzes/entities/quiz-submission.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Lesson, QuizSubmission]),
    PassportModule,
    AuthModule,
    NotificationsModule,
    RewardsModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
