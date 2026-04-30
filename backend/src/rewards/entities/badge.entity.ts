import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Stable programmatic identifier for seeding and lookups */
  @Index({ unique: true })
  @Column()
  key: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  /** Total XP at or above which this badge is earned */
  @Column({ type: 'int' })
  xpThreshold: number;

  @Column({ type: 'varchar', nullable: true })
  iconUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
