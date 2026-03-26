import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { AdminCoursesController } from '../admin/admin-courses.controller';
import { CoursesService } from './courses.service';
import { CourseRegistration } from './entities/course-registration.entity';
import { AuthModule } from '../auth/auth.module';
import { PaginationService } from '../common/services/pagination.service';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../progress/entities/progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseRegistration, Lesson, Progress]),
    AuthModule,
  ],
  controllers: [CoursesController, AdminCoursesController],
  providers: [CoursesService, PaginationService],
  exports: [CoursesService],
})
export class CoursesModule {}
