import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entities/course.entity';
import { CourseEnrollmentService } from './course-enrollment.service';
import { CourseEnrollmentController } from './course-enrollment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEnrollment, Student, Course])],
  providers: [CourseEnrollmentService],
  controllers: [CourseEnrollmentController],
  exports: [CourseEnrollmentService],
})
export class CourseEnrollmentModule {}
