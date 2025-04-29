import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('course_enrollments')
@Unique(['student', 'course'])
export class CourseEnrollment {
  @ApiProperty({ description: 'Unique ID for the enrollment' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The student who enrolled' })
  @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
  student: Student;

  @ApiProperty({ description: 'The course the student enrolled in' })
  @ManyToOne(() => Course, { eager: true, onDelete: 'CASCADE' })
  course: Course;

  @ApiProperty({ description: 'When the enrollment was created' })
  @CreateDateColumn()
  createdAt: Date;
}
