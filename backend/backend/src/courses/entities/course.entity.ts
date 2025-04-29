import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Tutor } from '../../tutor/entities/tutor.entity';
import { CourseReview } from './course-review.entity';
import { Progress } from 'src/progress/entities/progress.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  duration: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Progress, (progress) => progress.course)
  progress: Progress[];
}
