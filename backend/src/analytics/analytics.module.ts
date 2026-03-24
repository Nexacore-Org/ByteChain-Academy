import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from 'src/certificates/entities/certificate.entity';
import { CourseRegistration } from 'src/courses/entities/course-registration.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Progress } from 'src/progress/entities/progress.entity';
import { QuizSubmission } from 'src/quizzes/entities/quiz-submission.entity';
import { User } from 'src/users/entities/user.entity';
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
