import { Exclude } from 'class-transformer';
import { LessonQuizResult } from 'src/lesson-quiz-result/entities/lesson-quiz-result.entity';
import { Progress } from 'src/progress/entities/progress.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  phoneNumber?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Progress, (progress) => progress.student)
  progress: Progress[];

  @OneToMany(() => LessonQuizResult, (result) => result.student, {
    cascade: true,
  })
  lessonQuizResults: LessonQuizResult[];
}
