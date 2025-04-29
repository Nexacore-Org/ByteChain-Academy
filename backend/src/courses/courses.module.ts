import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseReview } from './entities/course-review.entity';
import { CourseReviewService } from './services/course-review.service';
import { CourseReviewController } from './controllers/course-review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseReview])],
  controllers: [CourseReviewController],
  providers: [CourseReviewService],
  exports: [CourseReviewService],
})
export class CoursesModule {}
