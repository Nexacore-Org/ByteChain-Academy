import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import { CourseRegistration } from '../entities/course-registration.entity';
import { Lesson } from '../entities/lesson.entity';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { QuizSubmission } from '../entities/quiz-submission.entity';
import { Certificate } from '../entities/certificate.entity';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { ProfileController } from '../controllers/profile.controller';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Course, CourseRegistration, Lesson, Quiz, Question, QuizSubmission, Certificate],
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
export class AuthModule { }
