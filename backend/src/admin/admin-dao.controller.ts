import {
  Controller,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DAOService } from '../dao/dao.service';
import {
  DAOProposal,
  ProposalStatus,
} from '../dao/entities/dao-proposal.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ModerateProposalDto } from './dto/moderate-proposal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

interface AdminProposalResponse {
  proposals: (DAOProposal & {
    proposerEmail: string;
    moderatorEmail?: string;
  })[];
  total: number;
  page: number;
  limit: number;
}

@ApiTags('Admin — DAO')
@ApiBearerAuth('access-token')
@Controller('admin/dao')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDAOController {
  constructor(
    private readonly daoService: DAOService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('proposals')
  @ApiOperation({
    summary: 'Get all proposals with moderation details (admin)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProposalStatus,
    description: 'Filter by proposal status',
  })
  @ApiResponse({ status: 200, description: 'Proposals retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAllProposals(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('status') status?: ProposalStatus,
  ): Promise<AdminProposalResponse> {
    const query = this.daoService['proposalRepository']
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.proposer', 'proposer')
      .leftJoinAndSelect('proposal.moderator', 'moderator')
      .leftJoinAndSelect('proposal.votes', 'votes')
      .orderBy('proposal.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.where('proposal.status = :status', { status });
    }

    const [proposals, total] = await query.getManyAndCount();

    const proposalsWithEmails = proposals.map((proposal) => ({
      ...proposal,
      proposerEmail: proposal.proposer?.email || 'Unknown',
      moderatorEmail: proposal.moderator?.email || undefined,
    }));

    return {
      proposals: proposalsWithEmails,
      total,
      page,
      limit,
    };
  }

  @Delete('proposals/:id')
  @ApiOperation({ summary: 'Moderate and reject a proposal (admin)' })
  @ApiResponse({ status: 200, description: 'Proposal moderated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async moderateProposal(
    @Param('id') id: string,
    @Body() moderateProposalDto: ModerateProposalDto,
    @Request() req,
  ): Promise<DAOProposal> {
    const proposal = await this.daoService.getProposalById(id);

    if (proposal.status === ProposalStatus.REJECTED && proposal.moderatedAt) {
      throw new BadRequestException('Proposal has already been moderated');
    }

    // Update proposal with moderation details
    proposal.status = ProposalStatus.REJECTED;
    proposal.moderationReason = moderateProposalDto.reason;
    proposal.moderatedAt = new Date();
    proposal.moderatorId = req.user.id;

    return this.daoService['proposalRepository'].save(proposal);
  }
}
