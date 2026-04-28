import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
  ParseIntPipe,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DAOService } from './dao.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { ProposalStatus } from './entities/dao-proposal.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('DAO')
@Controller('dao')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DAOController {
  constructor(private readonly daoService: DAOService) {}

  @Post('proposals')
  @ApiOperation({ summary: 'Create a new proposal' })
  @ApiResponse({ status: 201, description: 'Proposal created successfully' })
  create(@Request() req, @Body() createProposalDto: CreateProposalDto) {
    return this.daoService.createProposal(req.user.id, createProposalDto);
  }

  @Get('proposals')
  @ApiOperation({ summary: 'Get all proposals' })
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('status') status?: ProposalStatus,
  ) {
    return this.daoService.getAllProposals(page, limit, status);
  }

  @Get('proposals/:id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  getOne(@Param('id') id: string) {
    return this.daoService.getProposalById(id);
  }

  @Post('proposals/:id/vote')
  @ApiOperation({ summary: 'Cast a vote on a proposal' })
  vote(
    @Request() req,
    @Param('id') id: string,
    @Body() castVoteDto: CastVoteDto,
  ) {
    return this.daoService.castVote(req.user.id, id, castVoteDto.vote);
  }

  @Patch('proposals/:id')
  @ApiOperation({ summary: 'Edit proposal (owner only, before any votes)' })
  @ApiResponse({ status: 200, description: 'Proposal updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - has votes or invalid data',
  })
  edit(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ) {
    return this.daoService.editProposal(req.user.id, id, updateProposalDto);
  }

  @Delete('proposals/:id')
  @ApiOperation({ summary: 'Withdraw proposal (owner only, active proposals)' })
  @ApiResponse({ status: 204, description: 'Proposal withdrawn successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 400, description: 'Bad request - not active' })
  @HttpCode(HttpStatus.NO_CONTENT)
  withdraw(@Request() req, @Param('id') id: string) {
    return this.daoService.withdrawProposal(req.user.id, id);
  }
}
