import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { AdminCoursesController } from '../admin/admin-courses.controller';
import { CoursesService } from './courses.service';
import { CourseRegistration } from './entities/course-registration.entity';
import { AuthModule } from '../auth/auth.module';
import { PaginationService } from '../common/services/pagination.service';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseRegistration]), forwardRef(() => AuthModule), forwardRef(() => LessonsModule)],
  controllers: [CoursesController, AdminCoursesController],
  providers: [CoursesService, PaginationService],
  exports: [CoursesService],
})
export class CoursesModule {}
