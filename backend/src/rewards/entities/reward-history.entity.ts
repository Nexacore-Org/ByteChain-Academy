import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reward_history')
export class RewardHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  activityType: 'lesson' | 'course';

  @Column()
  activityId: string;

  @Column({ type: 'int' })
  points: number;

  @CreateDateColumn()
  awardedAt: Date;
}
