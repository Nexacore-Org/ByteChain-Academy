import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { DAOService } from './dao.service';
import {
  type CreateProposalDto,
  ProposalStatus,
  ProposalType,
} from './dto/create-proposal.dto';
import type { UpdateProposalDto } from './dto/update-proposal.dto';
import type { VoteProposalDto } from './dto/vote-proposal.dto';

// Mock auth guard for demonstration
class AuthGuard {
  canActivate() {
    return true;
  }
}

@ApiTags('DAO Proposals')
@Controller('dao')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DAOController {
  constructor(private readonly daoService: DAOService) {}

  @Post('proposals')
  @ApiOperation({ summary: 'Create a new proposal' })
  @ApiResponse({
    status: 201,
    description: 'Proposal created successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'Introduction to Smart Contracts',
        description:
          'A comprehensive course covering smart contract fundamentals',
        type: 'course',
        status: 'pending',
        tags: ['blockchain', 'ethereum'],
        authorId: 'user-uuid',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        votes: [],
        voteCount: { approve: 0, reject: 0, abstain: 0 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  createProposal(
    createProposalDto: CreateProposalDto,
    req: { user?: { id?: string } },
  ) {
    const userId: string = req.user?.id ?? 'mock-user-id'; // Mock user ID
    return this.daoService.createProposal(createProposalDto, userId);
  }

  @Get('proposals')
  @ApiOperation({ summary: 'Get all proposals with optional filtering' })
  @ApiQuery({ name: 'status', enum: ProposalStatus, required: false })
  @ApiQuery({ name: 'type', enum: ProposalType, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of proposals',
    schema: {
      type: 'array',
      items: {
        example: {
          id: 'uuid',
          title: 'Introduction to Smart Contracts',
          status: 'pending',
          type: 'course',
        },
      },
    },
  })
  findAllProposals(
    @Query('status') status?: ProposalStatus,
    @Query('type') type?: ProposalType,
  ) {
    return this.daoService.findAllProposals(status, type);
  }

  @Get('proposals/stats')
  @ApiOperation({ summary: 'Get proposal statistics' })
  @ApiResponse({
    status: 200,
    description: 'Proposal statistics',
    schema: {
      example: {
        total: 10,
        byStatus: { pending: 5, approved: 3, rejected: 2 },
        byType: { course: 6, lesson: 3, article: 1 },
      },
    },
  })
  getProposalStats() {
    return this.daoService.getProposalStats();
  }

  @Get('proposals/:id')
  @ApiOperation({ summary: 'Get a proposal by ID' })
  @ApiResponse({ status: 200, description: 'Proposal details' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  findProposalById(@Param('id') id: string) {
    return this.daoService.findProposalById(id);
  }

  @Patch('proposals/:id')
  @ApiOperation({ summary: 'Update a proposal' })
  @ApiResponse({ status: 200, description: 'Proposal updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not the proposal author',
  })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  updateProposal(
    @Param('id') id: string,
    updateProposalDto: UpdateProposalDto,
    req: { user?: { id?: string } },
  ) {
    const userId = req.user?.id || 'mock-user-id';
    return this.daoService.updateProposal(id, updateProposalDto, userId);
  }

  @Patch('proposals/:id/review')
  @ApiOperation({ summary: 'Review a proposal (admin only)' })
  @ApiResponse({ status: 200, description: 'Proposal reviewed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid status or proposal already reviewed',
  })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  reviewProposal(
    @Param('id') id: string,
    body: { status: ProposalStatus },
    req: { user?: { id?: string } },
  ) {
    return this.daoService.reviewProposal(id, body.status);
  }

  @Post('proposals/:id/vote')
  @ApiOperation({ summary: 'Vote on a proposal' })
  @ApiResponse({ status: 201, description: 'Vote submitted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid vote or user already voted',
  })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  @HttpCode(HttpStatus.CREATED)
  voteOnProposal(
    @Param('id') id: string,
    voteDto: VoteProposalDto,
    req: { user?: { id?: string } },
  ) {
    const userId = req.user?.id || 'mock-user-id';
    return this.daoService.voteOnProposal(id, voteDto, userId);
  }

  @Get('proposals/:id/votes')
  @ApiOperation({ summary: 'Get all votes for a proposal' })
  @ApiResponse({
    status: 200,
    description: 'List of votes for the proposal',
    schema: {
      type: 'array',
      items: {
        example: {
          id: 'vote-uuid',
          proposalId: 'proposal-uuid',
          userId: 'user-uuid',
          vote: 'approve',
          comment: 'Great proposal!',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  getProposalVotes(@Param('id') id: string) {
    return this.daoService.getProposalVotes(id);
  }

  @Delete('proposals/:id')
  @ApiOperation({ summary: 'Delete a proposal' })
  @ApiResponse({ status: 204, description: 'Proposal deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not the proposal author',
  })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProposal(@Param('id') id: string, req: { user?: { id?: string } }) {
    const userId: string = req.user?.id ?? 'mock-user-id';
    this.daoService.deleteProposal(id, userId);
  }
}
