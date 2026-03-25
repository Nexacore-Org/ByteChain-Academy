import { ProposalStatus } from '../entities/dao-proposal.entity';

export class ProposalResponseDto {
  id: string;
  title: string;
  description: string;
  proposerId: string;
  status: ProposalStatus;
  votingDeadline: Date;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  createdAt: Date;
  proposer?: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export class PaginatedProposalsDto {
  proposals: ProposalResponseDto[];
  total: number;
  page: number;
  limit: number;
}
