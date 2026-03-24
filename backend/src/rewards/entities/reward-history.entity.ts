import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum XpRewardReason {
  LESSON_COMPLETE = 'LESSON_COMPLETE',
  QUIZ_PASS = 'QUIZ_PASS',
  COURSE_COMPLETE = 'COURSE_COMPLETE',
}

@Entity('reward_history')
export class RewardHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  amount: number;

  @Column({
    type: 'varchar',
  })
  reason: XpRewardReason;

  @CreateDateColumn()
  createdAt: Date;
}
