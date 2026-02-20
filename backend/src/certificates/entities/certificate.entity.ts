import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';

@Entity('certificates')
@Index(['certificateHash'], { unique: true })
@Unique(['user', 'course'])
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Cryptographic / verifiable hash of the certificate
   */
  @Column()
  certificateHash: string;

  /**
   * Recipient info (denormalized for easy access & PDF rendering)
   */
  @Column()
  recipientName: string;

  @Column()
  recipientEmail: string;

  /**
   * Course / Program title snapshot
   */
  @Column()
  courseOrProgram: string;

  /**
   * Extra certificate metadata (JSON string)
   * e.g. score, completion time, instructor, platform name
   */
  @Column({ type: 'text' })
  certificateData: string;

  /**
   * Relational links (source of truth)
   */
  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Course, { eager: true })
  course: Course;

  /**
   * Certificate lifecycle
   */
  @Column()
  issuedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  isValid: boolean;

  /**
   * Optional PDF path
   */
  @Column({ nullable: true })
  certificatePath?: string;

  /**
   * Audit timestamps
   */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
