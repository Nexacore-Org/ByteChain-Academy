import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  name: string | null;

  @Column({ nullable: true })
  username: string | null;

  @Column({ nullable: true })
  bio: string | null;

  @Column({ unique: true, nullable: true })
  walletAddress: string | null;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @Column({
    type: 'varchar',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  suspended: boolean;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ nullable: true })
  learningGoal: string | null;

  @Column({ type: 'int', default: 0 })
  lessonsCompleted: number;

  @Column({ type: 'int', default: 0 })
  coursesCompleted: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'datetime', nullable: true })
  lastActiveAt: Date | null;

  @Column({ nullable: true })
  @Exclude()
  resetToken: string | null;

  @Column({ nullable: true })
  @Exclude()
  resetTokenExpires: Date | null;

  @Column({ type: 'int', default: 0 })
  @Exclude()
  failedLoginAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  @Exclude()
  lockedUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
