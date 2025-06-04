// QuizAnalytics entity
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quiz_analytics')
export class QuizAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  lessonId: number;

  @Column()
  quizId: number;

  @Column('int')
  score: number;

  @Column('int')
  attempt: number;

  @CreateDateColumn()
  createdAt: Date;
}
