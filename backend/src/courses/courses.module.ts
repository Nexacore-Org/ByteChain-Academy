import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { AdminCoursesController } from '../admin/admin-courses.controller';
import { CoursesService } from './courses.service';
import { CourseRegistration } from './entities/course-registration.entity';
import { PaginationService } from '../common/services/pagination.service';
import { LessonsModule } from '../lessons/lessons.module';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../progress/entities/progress.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseRegistration, Lesson, Progress]),
    forwardRef(() => LessonsModule),
    NotificationsModule,
  ],
  controllers: [CoursesController, AdminCoursesController],
  providers: [CoursesService, PaginationService],
  exports: [CoursesService],
})
export class CoursesModule {}
