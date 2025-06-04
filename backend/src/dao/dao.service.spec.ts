import { Test, type TestingModule } from '@nestjs/testing';
import { DAOService } from './dao.service';
import {
  type CreateProposalDto,
  ProposalType,
  ProposalStatus,
} from './dto/create-proposal.dto';
import { type VoteProposalDto, VoteType } from './dto/vote-proposal.dto';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('DAOService', () => {
  let service: DAOService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DAOService],
    }).compile();

    service = module.get<DAOService>(DAOService);
  });

  describe('createProposal', () => {
    it('should create a proposal successfully', async () => {
      const createProposalDto: CreateProposalDto = {
        title: 'Test Proposal',
        description: 'This is a test proposal for unit testing purposes',
        type: ProposalType.COURSE,
        tags: ['test', 'unit-testing'],
        estimatedDuration: 10,
      };

      const result = await service.createProposal(createProposalDto, 'user-1');

      expect(result).toBeDefined();
      expect(result.title).toBe(createProposalDto.title);
      expect(result.status).toBe(ProposalStatus.PENDING);
      expect(result.authorId).toBe('user-1');
      expect(result.voteCount).toEqual({ approve: 0, reject: 0, abstain: 0 });
    });
  });

  describe('findAllProposals', () => {
    beforeEach(async () => {
      await service.createProposal(
        {
          title: 'Course Proposal',
          description: 'A course proposal for testing',
          type: ProposalType.COURSE,
          tags: ['course'],
        },
        'user-1',
      );

      await service.createProposal(
        {
          title: 'Article Proposal',
          description: 'An article proposal for testing',
          type: ProposalType.ARTICLE,
          tags: ['article'],
        },
        'user-2',
      );
    });

    it('should return all proposals', async () => {
      const result = await service.findAllProposals();
      expect(result).toHaveLength(2);
    });

    it('should filter proposals by status', async () => {
      const result = await service.findAllProposals(ProposalStatus.PENDING);
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.status === ProposalStatus.PENDING)).toBe(
        true,
      );
    });

    it('should filter proposals by type', async () => {
      const result = await service.findAllProposals(
        undefined,
        ProposalType.COURSE,
      );
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(ProposalType.COURSE);
    });
  });

  describe('findProposalById', () => {
    it('should return a proposal by ID', async () => {
      const proposal = await service.createProposal(
        {
          title: 'Test Proposal',
          description: 'Test description for finding by ID',
          type: ProposalType.LESSON,
          tags: ['test'],
        },
        'user-1',
      );

      const result = await service.findProposalById(proposal.id);
      expect(result).toEqual(proposal);
    });

    it('should throw NotFoundException for non-existent proposal', async () => {
      await expect(service.findProposalById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProposal', () => {
    let proposalId: string;

    beforeEach(async () => {
      const proposal = await service.createProposal(
        {
          title: 'Original Title',
          description: 'Original description for update testing',
          type: ProposalType.COURSE,
          tags: ['original'],
        },
        'user-1',
      );
      proposalId = proposal.id;
    });

    it('should update a proposal successfully', async () => {
      const updateDto = {
        title: 'Updated Title',
        description: 'Updated description for testing',
      };

      const result = await service.updateProposal(
        proposalId,
        updateDto,
        'user-1',
      );
      expect(result.title).toBe(updateDto.title);
      expect(result.description).toBe(updateDto.description);
    });

    it('should throw ForbiddenException for non-author', async () => {
      const updateDto = { title: 'Unauthorized Update' };

      await expect(
        service.updateProposal(proposalId, updateDto, 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for status update', async () => {
      const updateDto = { status: ProposalStatus.APPROVED };

      await expect(
        service.updateProposal(proposalId, updateDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('voteOnProposal', () => {
    let proposalId: string;

    beforeEach(async () => {
      const proposal = await service.createProposal(
        {
          title: 'Voting Test Proposal',
          description: 'A proposal for testing voting functionality',
          type: ProposalType.ARTICLE,
          tags: ['voting', 'test'],
        },
        'user-1',
      );
      proposalId = proposal.id;
    });

    it('should allow voting on a proposal', async () => {
      const voteDto: VoteProposalDto = {
        vote: VoteType.APPROVE,
        comment: 'Great proposal!',
      };

      const result = await service.voteOnProposal(
        proposalId,
        voteDto,
        'user-2',
      );
      expect(result.vote).toBe(VoteType.APPROVE);
      expect(result.comment).toBe('Great proposal!');

      const proposal = await service.findProposalById(proposalId);
      expect(proposal.voteCount.approve).toBe(1);
    });

    it('should prevent duplicate voting', async () => {
      const voteDto: VoteProposalDto = { vote: VoteType.APPROVE };

      await service.voteOnProposal(proposalId, voteDto, 'user-2');

      await expect(
        service.voteOnProposal(proposalId, voteDto, 'user-2'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reviewProposal', () => {
    let proposalId: string;

    beforeEach(async () => {
      const proposal = await service.createProposal(
        {
          title: 'Review Test Proposal',
          description: 'A proposal for testing review functionality',
          type: ProposalType.COURSE,
          tags: ['review', 'test'],
        },
        'user-1',
      );
      proposalId = proposal.id;
    });

    it('should review a proposal successfully', async () => {
      const result = await service.reviewProposal(
        proposalId,
        ProposalStatus.APPROVED,
        'reviewer-1',
      );
      expect(result.status).toBe(ProposalStatus.APPROVED);
    });

    it('should prevent re-reviewing approved proposals', async () => {
      await service.reviewProposal(
        proposalId,
        ProposalStatus.APPROVED,
        'reviewer-1',
      );

      await expect(
        service.reviewProposal(
          proposalId,
          ProposalStatus.REJECTED,
          'reviewer-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProposalStats', () => {
    beforeEach(async () => {
      await service.createProposal(
        {
          title: 'Course 1',
          description: 'First course proposal',
          type: ProposalType.COURSE,
          tags: ['course'],
        },
        'user-1',
      );

      const proposal2 = await service.createProposal(
        {
          title: 'Article 1',
          description: 'First article proposal',
          type: ProposalType.ARTICLE,
          tags: ['article'],
        },
        'user-2',
      );

      await service.reviewProposal(
        proposal2.id,
        ProposalStatus.APPROVED,
        'reviewer-1',
      );
    });

    it('should return correct statistics', async () => {
      const stats = await service.getProposalStats();

      expect(stats.total).toBe(2);
      expect(stats.byStatus[ProposalStatus.PENDING]).toBe(1);
      expect(stats.byStatus[ProposalStatus.APPROVED]).toBe(1);
      expect(stats.byType[ProposalType.COURSE]).toBe(1);
      expect(stats.byType[ProposalType.ARTICLE]).toBe(1);
    });
  });
});
