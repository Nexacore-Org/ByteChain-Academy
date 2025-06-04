import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  type CreateProposalDto,
  ProposalStatus,
} from './dto/create-proposal.dto';
import type { UpdateProposalDto } from './dto/update-proposal.dto';
import type { VoteProposalDto } from './dto/vote-proposal.dto';
import type { Proposal, Vote } from './entities/proposal.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DAOService {
  private proposals: Map<string, Proposal> = new Map();
  private votes: Map<string, Vote> = new Map();

  createProposal(
    createProposalDto: CreateProposalDto,
    authorId: string,
  ): Proposal {
    const proposalId = uuidv4();
    const now = new Date();

    const proposal: Proposal = {
      id: proposalId,
      ...createProposalDto,
      status: ProposalStatus.PENDING,
      authorId,
      createdAt: now,
      updatedAt: now,
      votes: [],
      voteCount: {
        approve: 0,
        reject: 0,
        abstain: 0,
      },
    };

    this.proposals.set(proposalId, proposal);
    return proposal;
  }

  findAllProposals(status?: ProposalStatus, type?: string): Proposal[] {
    let proposals = Array.from(this.proposals.values());

    if (status) {
      proposals = proposals.filter((proposal) => proposal.status === status);
    }

    if (type) {
      proposals = proposals.filter(
        (proposal) => String(proposal.type) === String(type),
      );
    }

    return proposals.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  findProposalById(id: string): Proposal {
    const proposal = this.proposals.get(id);
    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }
    return proposal;
  }

  updateProposal(
    id: string,
    updateProposalDto: UpdateProposalDto,
    userId: string,
  ): Proposal {
    const proposal = this.findProposalById(id);

    // Only author or admin can update proposal
    if (proposal.authorId !== userId) {
      throw new ForbiddenException(
        'Only the proposal author can update this proposal',
      );
    }

    // Don't allow status updates through this method
    if (updateProposalDto.status) {
      throw new BadRequestException(
        'Status updates should be done through the review process',
      );
    }

    const updatedProposal = {
      ...proposal,
      ...updateProposalDto,
      updatedAt: new Date(),
    };

    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }

  reviewProposal(id: string, status: ProposalStatus): Proposal {
    const proposal = this.findProposalById(id);

    if (
      proposal.status === ProposalStatus.APPROVED ||
      proposal.status === ProposalStatus.REJECTED
    ) {
      throw new BadRequestException('Proposal has already been reviewed');
    }

    const updatedProposal = {
      ...proposal,
      status,
      updatedAt: new Date(),
    };

    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }

  voteOnProposal(
    proposalId: string,
    voteDto: VoteProposalDto,
    userId: string,
  ): Vote {
    const proposal = this.findProposalById(proposalId);

    if (
      proposal.status !== ProposalStatus.PENDING &&
      proposal.status !== ProposalStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        'Voting is only allowed on pending or under review proposals',
      );
    }

    // Check if user has already voted
    const existingVote = Array.from(this.votes.values()).find(
      (vote) => vote.proposalId === proposalId && vote.userId === userId,
    );

    if (existingVote) {
      throw new BadRequestException('User has already voted on this proposal');
    }

    const voteId = uuidv4();
    const vote: Vote = {
      id: voteId,
      proposalId,
      userId,
      vote: voteDto.vote,
      comment: voteDto.comment,
      createdAt: new Date(),
    };

    this.votes.set(voteId, vote);

    // Update proposal vote count
    proposal.voteCount[voteDto.vote]++;
    proposal.votes.push(vote);
    this.proposals.set(proposalId, proposal);

    return vote;
  }

  getProposalVotes(proposalId: string): Vote[] {
    this.findProposalById(proposalId); // Ensure proposal exists

    return Array.from(this.votes.values()).filter(
      (vote) => vote.proposalId === proposalId,
    );
  }

  deleteProposal(id: string, userId: string): void {
    const proposal = this.findProposalById(id);

    if (proposal.authorId !== userId) {
      throw new ForbiddenException(
        'Only the proposal author can delete this proposal',
      );
    }

    if (proposal.status !== ProposalStatus.PENDING) {
      throw new BadRequestException('Only pending proposals can be deleted');
    }

    // Delete associated votes
    const proposalVotes = Array.from(this.votes.entries()).filter(
      ([, vote]) => vote.proposalId === id,
    );
    proposalVotes.forEach(([voteId]) => this.votes.delete(voteId));

    this.proposals.delete(id);
  }

  getProposalStats(): {
    total: number;
    byStatus: Record<ProposalStatus, number>;
    byType: Record<string, number>;
  } {
    const proposals = Array.from(this.proposals.values());

    const byStatus = proposals.reduce(
      (acc, proposal) => {
        acc[proposal.status] = (acc[proposal.status] || 0) + 1;
        return acc;
      },
      {} as Record<ProposalStatus, number>,
    );

    const byType = proposals.reduce(
      (acc, proposal) => {
        acc[proposal.type] = (acc[proposal.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: proposals.length,
      byStatus,
      byType,
    };
  }
}
