// LessonAnalytics entity
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lesson_analytics')
export class LessonAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  lessonId: number;

  @Column({ type: 'timestamp' })
  lessonStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  lessonEndTime: Date;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
