import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NotificationType, UserRole } from '../enums/notification.enums';

@Entity('notifications')
@Index(['recipientId', 'recipientRole'])
@Index(['isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  recipientId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  recipientRole: UserRole;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('text')
  message: string;

  @Column({ default: false })
  @Index()
  isRead: boolean;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column('uuid', { nullable: true })
  senderId?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  senderRole?: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
