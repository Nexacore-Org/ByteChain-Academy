import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { Student } from '../student/entities/student.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class CourseEnrollmentService {
  constructor(
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepository: Repository<CourseEnrollment>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async enroll(studentId: string, courseId: string): Promise<CourseEnrollment> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existing = await this.enrollmentRepository.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (existing) {
      throw new ConflictException('Student already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({ student, course });
    return this.enrollmentRepository.save(enrollment);
  }

  async leaveCourse(studentId: string, courseId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.enrollmentRepository.remove(enrollment);
  }
}
