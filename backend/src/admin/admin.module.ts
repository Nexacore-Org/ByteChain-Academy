import { Module } from '@nestjs/common';
import { AdminCoursesController } from './admin-courses.controller';
import { CoursesModule } from '../courses/courses.module';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [CoursesModule, LessonsModule],
  controllers: [AdminCoursesController],
})
export class AdminModule {}
