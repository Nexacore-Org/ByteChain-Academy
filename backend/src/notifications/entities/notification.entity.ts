import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  BADGE_EARNED = 'BADGE_EARNED',
  CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',
  LESSON_COMPLETE = 'LESSON_COMPLETE',
  QUIZ_PASSED = 'QUIZ_PASSED',
  COURSE_COMPLETE = 'COURSE_COMPLETE',
  NEW_CONTENT = 'NEW_CONTENT',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
  })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  link: string | null;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
