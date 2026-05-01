import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Course, Quiz]),
    PassportModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
