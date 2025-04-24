import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Course } from './course.entity';
import { Student } from '../../student/entities/student.entity';

@Entity()
export class CourseReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => Course, (course) => course.reviews, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  courseId: string;

  @ManyToOne(() => Student)
  student: Student;

  @Column()
  studentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
