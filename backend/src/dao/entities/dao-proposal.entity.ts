import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DAOVote } from './dao-vote.entity';

export enum ProposalStatus {
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
}

@Entity('dao_proposals')
export class DAOProposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  proposerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'proposerId' })
  proposer: User;

  @Column({
    type: 'varchar',
    default: ProposalStatus.ACTIVE,
  })
  status: ProposalStatus;

  @Column({ type: 'datetime' })
  votingDeadline: Date;

  @Column({ type: 'int', default: 0 })
  yesVotes: number;

  @Column({ type: 'int', default: 0 })
  noVotes: number;

  @Column({ type: 'int', default: 0 })
  abstainVotes: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  moderationReason: string | null;

  @Column({ type: 'datetime', nullable: true })
  moderatedAt: Date | null;

  @Column({ nullable: true })
  moderatorId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'moderatorId' })
  moderator: User;

  @OneToMany(() => DAOVote, (vote) => vote.proposal)
  votes: DAOVote[];
}
