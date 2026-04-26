import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DAOProposal, ProposalStatus } from './entities/dao-proposal.entity';
import { DAOVote, VoteType } from './entities/dao-vote.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DAOService {
  constructor(
    @InjectRepository(DAOProposal)
    private proposalRepository: Repository<DAOProposal>,
    @InjectRepository(DAOVote)
    private voteRepository: Repository<DAOVote>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createProposal(
    userId: string,
    dto: CreateProposalDto,
  ): Promise<DAOProposal> {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    const proposal = this.proposalRepository.create({
      ...dto,
      proposerId: userId,
      status: ProposalStatus.ACTIVE,
      votingDeadline: deadline,
    });

    return this.proposalRepository.save(proposal);
  }

  async getAllProposals(
    page = 1,
    limit = 10,
    status?: ProposalStatus,
  ): Promise<{ proposals: DAOProposal[]; total: number }> {
    const query = this.proposalRepository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.proposer', 'proposer')
      .orderBy('proposal.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.where('proposal.status = :status', { status });
    } else {
      // Exclude WITHDRAWN proposals from default list
      query.where('proposal.status != :withdrawn', { withdrawn: ProposalStatus.WITHDRAWN });
    }

    const [proposals, total] = await query.getManyAndCount();
    return { proposals, total };
  }

  async getProposalById(id: string): Promise<DAOProposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: ['proposer'],
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    return proposal;
  }

  async castVote(
    userId: string,
    proposalId: string,
    voteType: VoteType,
  ): Promise<DAOProposal> {
    const proposal = await this.getProposalById(proposalId);

    if (proposal.status !== ProposalStatus.ACTIVE) {
      throw new BadRequestException(
        'Voting is only allowed on ACTIVE proposals',
      );
    }

    if (new Date() > proposal.votingDeadline) {
      throw new BadRequestException('The voting deadline has passed');
    }

    const existingVote = await this.voteRepository.findOne({
      where: { proposalId, voterId: userId },
    });

    if (existingVote) {
      throw new ConflictException('You have already voted on this proposal');
    }

    return await this.dataSource.transaction(async (manager) => {
      const vote = manager.create(DAOVote, {
        proposalId,
        voterId: userId,
        vote: voteType,
      });
      await manager.save(vote);

      let incrementField: string;
      switch (voteType) {
        case VoteType.YES:
          incrementField = 'yesVotes';
          break;
        case VoteType.NO:
          incrementField = 'noVotes';
          break;
        case VoteType.ABSTAIN:
          incrementField = 'abstainVotes';
          break;
      }

      await manager.increment(
        DAOProposal,
        { id: proposalId },
        incrementField,
        1,
      );

      const updatedProposal = await manager.findOne(DAOProposal, {
        where: { id: proposalId },
      });
      if (!updatedProposal) {
        throw new NotFoundException(
          `Proposal with ID ${proposalId} not found after update`,
        );
      }
      return updatedProposal;
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async closeExpiredProposals() {
    const expiredProposals = await this.proposalRepository.find({
      where: {
        status: ProposalStatus.ACTIVE,
        votingDeadline: LessThan(new Date()),
      },
    });

    if (expiredProposals.length === 0) return;

    // Get total count of active users for threshold calculation
    // "Active users" is often defined by those who logged in recently or have some XP.
    // For simplicity, we'll count all registered users unless otherwise specified.
    const activeUsersCount = await this.userRepository.count();

    for (const proposal of expiredProposals) {
      // A proposal passes when it receives more than 50% yes votes from active users
      const passThreshold = activeUsersCount * 0.5;

      if (proposal.yesVotes > passThreshold) {
        proposal.status = ProposalStatus.PASSED;
      } else {
        proposal.status = ProposalStatus.REJECTED;
      }

      await this.proposalRepository.save(proposal);
    }
  }

  async editProposal(
    userId: string,
    proposalId: string,
    dto: UpdateProposalDto,
  ): Promise<DAOProposal> {
    const proposal = await this.getProposalById(proposalId);

    if (proposal.proposerId !== userId) {
      throw new ForbiddenException('Only the proposal owner can edit it');
    }

    const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
    if (totalVotes > 0) {
      throw new BadRequestException('Cannot edit proposal that has received votes');
    }

    if (dto.title !== undefined) {
      proposal.title = dto.title;
    }
    if (dto.description !== undefined) {
      proposal.description = dto.description;
    }

    return this.proposalRepository.save(proposal);
  }

  async withdrawProposal(userId: string, proposalId: string): Promise<DAOProposal> {
    const proposal = await this.getProposalById(proposalId);

    if (proposal.proposerId !== userId) {
      throw new ForbiddenException('Only the proposal owner can withdraw it');
    }

    if (proposal.status !== ProposalStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE proposals can be withdrawn');
    }

    proposal.status = ProposalStatus.WITHDRAWN;
    return this.proposalRepository.save(proposal);
  }
}
