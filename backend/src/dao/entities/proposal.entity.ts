import type { ProposalType, ProposalStatus } from '../dto/create-proposal.dto';
import type { VoteType } from '../dto/vote-proposal.dto';

export class Proposal {
  id: string;
  title: string;
  description: string;
  type: ProposalType;
  status: ProposalStatus;
  tags: string[];
  estimatedDuration?: number;
  prerequisites?: string;
  learningObjectives?: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  votes: Vote[];
  voteCount: {
    approve: number;
    reject: number;
    abstain: number;
  };
}

export class Vote {
  id: string;
  proposalId: string;
  userId: string;
  vote: VoteType;
  comment?: string;
  createdAt: Date;
}
