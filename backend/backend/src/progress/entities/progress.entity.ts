// src/progress/progress.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Course } from 'src/courses/entities/course.entity';

@Entity('progress')
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.progress)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, (course) => course.progress)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ default: 0 })
  completedLessons: number;

  @Column({ default: 0 })
  completedQuizzes: number;

  @Column({ default: 0 })
  courseCompletionPercentage: number;
}
