import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseReview } from './entities/course-review.entity';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './services/courses.service';
import { CourseReviewController } from './controllers/course-review.controller';
import { CourseReviewService } from './services/course-review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseReview])],
  controllers: [CoursesController, CourseReviewController],
  providers: [CoursesService, CourseReviewService],
  exports: [CoursesService],
})
export class CourseModule {}
