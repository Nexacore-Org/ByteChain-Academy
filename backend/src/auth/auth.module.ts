import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { Lesson } from '../entities/lesson.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Question } from '../quizzes/entities/question.entity';
import { QuizSubmission } from '../quizzes/entities/quiz-submission.entity';
import { Certificate } from '../certificates/entities/certificate.entity';

import { ProfileController } from '../controllers/profile.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      autoLoadEntities: true,
      entities: [
        User,
        Course,
        CourseRegistration,
        Lesson,
        Quiz,
        Question,
        QuizSubmission,
        Certificate,
      ],

      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [UserService, AuthService, JwtStrategy],
  exports: [UserService, AuthService, JwtStrategy],
})
export class AuthModule {}
