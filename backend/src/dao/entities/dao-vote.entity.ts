import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DAOProposal } from './dao-proposal.entity';

export enum VoteType {
  YES = 'YES',
  NO = 'NO',
  ABSTAIN = 'ABSTAIN',
}

@Entity('dao_votes')
@Unique(['proposalId', 'voterId'])
export class DAOVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  proposalId: string;

  @ManyToOne(() => DAOProposal, (proposal) => proposal.votes)
  @JoinColumn({ name: 'proposalId' })
  proposal: DAOProposal;

  @Column()
  voterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'voterId' })
  voter: User;

  @Column({
    type: 'varchar',
  })
  vote: VoteType;

  @CreateDateColumn()
  createdAt: Date;
}
