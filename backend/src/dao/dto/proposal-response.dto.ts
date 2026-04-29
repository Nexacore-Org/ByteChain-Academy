import { ProposalStatus } from '../entities/dao-proposal.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ProposalResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  id: string;
  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  title: string;
  @ApiProperty({
    example: 'A concise description of the resource.',
    description: 'description field',
  })
  description: string;
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'proposerId field',
  })
  proposerId: string;
  @ApiProperty({ example: 'example', description: 'status field' })
  status: ProposalStatus;
  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'votingDeadline field',
  })
  votingDeadline: Date;
  @ApiProperty({ example: 1, description: 'yesVotes field' })
  yesVotes: number;
  @ApiProperty({ example: 1, description: 'noVotes field' })
  noVotes: number;
  @ApiProperty({ example: 1, description: 'abstainVotes field' })
  abstainVotes: number;
  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'createdAt field',
  })
  createdAt: Date;
  proposer?: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export class PaginatedProposalsDto {
  @ApiProperty({
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Example Proposal',
        description: 'A concise description of the resource.',
        proposerId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'pending',
        votingDeadline: '2026-04-22T00:00:00.000Z',
        yesVotes: 1,
        noVotes: 0,
        abstainVotes: 0,
        createdAt: '2026-04-22T00:00:00.000Z',
      },
    ],
    description: 'proposals field',
  })
  proposals: ProposalResponseDto[];
  @ApiProperty({ example: 1, description: 'total field' })
  total: number;
  @ApiProperty({ example: 1, description: 'page field' })
  page: number;
  @ApiProperty({ example: 1, description: 'limit field' })
  limit: number;
}
