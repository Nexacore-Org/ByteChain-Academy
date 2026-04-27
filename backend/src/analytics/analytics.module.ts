import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from '../certificates/entities/certificate.entity';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../progress/entities/progress.entity';
import { QuizSubmission } from '../quizzes/entities/quiz-submission.entity';
import { User } from '../users/entities/user.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
    TypeOrmModule.forFeature([
      User,
      Course,
      Lesson,
      Progress,
      QuizSubmission,
      Certificate,
      CourseRegistration,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
