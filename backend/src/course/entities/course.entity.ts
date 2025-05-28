import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { Lesson } from 'src/lessons/entities/lessons.entity';
import { Tutor } from 'src/tutor/entities/tutor.entity';
import { CourseReview } from './course-review.entity';
import { Progress } from 'src/progress/entities/progress.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'float', nullable: true })
  duration: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @OneToMany(() => Quiz, (quiz) => quiz.course)
  quizzes: Quiz[];

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @ManyToOne(() => Tutor, (tutor) => tutor.courses)
  tutor: Tutor;

  @Column()
  tutorId: string;

  @OneToMany(() => CourseReview, (review) => review.course)
  reviews: CourseReview[];

   @OneToMany(() => Progress, (progress) => progress.course)
    progress: Progress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}