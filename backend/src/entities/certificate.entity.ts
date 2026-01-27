import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('certificates')
@Index(['certificateHash'], { unique: true })
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  certificateHash: string;

  @Column()
  recipientName: string;

  @Column()
  recipientEmail: string;

  @Column()
  courseOrProgram: string;

  @Column({ type: 'text' })
  certificateData: string; // JSON string with additional certificate data

  @Column()
  issuedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  isValid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
