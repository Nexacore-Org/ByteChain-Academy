import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DAOService } from './dao.service';
import { DAOProposal, ProposalStatus } from './entities/dao-proposal.entity';
import { DAOVote, VoteType } from './entities/dao-vote.entity';
import { User } from '../users/entities/user.entity';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('DAOService', () => {
  let service: DAOService;
  let proposalRepository: any;
  let voteRepository: any;
  let userRepository: any;
  let dataSource: any;

  const mockProposal = {
    id: 'prop-1',
    status: ProposalStatus.ACTIVE,
    votingDeadline: new Date(Date.now() + 10000),
    yesVotes: 0,
    noVotes: 0,
    abstainVotes: 0,
  };

  beforeEach(async () => {
    proposalRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    };
    voteRepository = {
      findOne: jest.fn(),
    };
    userRepository = {
      count: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DAOService,
        {
          provide: getRepositoryToken(DAOProposal),
          useValue: proposalRepository,
        },
        {
          provide: getRepositoryToken(DAOVote),
          useValue: voteRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<DAOService>(DAOService);
  });

  describe('castVote', () => {
    it('should throw NotFoundException if proposal does not exist', async () => {
      proposalRepository.findOne.mockResolvedValue(null);
      await expect(
        service.castVote('user-1', 'invalid', VoteType.YES),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if proposal is not ACTIVE', async () => {
      proposalRepository.findOne.mockResolvedValue({
        ...mockProposal,
        status: ProposalStatus.PASSED,
      });
      await expect(
        service.castVote('user-1', 'prop-1', VoteType.YES),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if deadline has passed', async () => {
      proposalRepository.findOne.mockResolvedValue({
        ...mockProposal,
        votingDeadline: new Date(Date.now() - 1000),
      });
      await expect(
        service.castVote('user-1', 'prop-1', VoteType.YES),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already voted', async () => {
      proposalRepository.findOne.mockResolvedValue(mockProposal);
      voteRepository.findOne.mockResolvedValue({ id: 'vote-1' });
      await expect(
        service.castVote('user-1', 'prop-1', VoteType.YES),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully cast a vote in a transaction', async () => {
      proposalRepository.findOne.mockResolvedValue(mockProposal);
      voteRepository.findOne.mockResolvedValue(null);

      const mockManager = {
        create: jest.fn().mockReturnValue({}),
        save: jest.fn(),
        increment: jest.fn(),
        findOne: jest.fn().mockResolvedValue({ ...mockProposal, yesVotes: 1 }),
      };

      dataSource.transaction.mockImplementation((cb) => cb(mockManager));

      const result = await service.castVote('user-1', 'prop-1', VoteType.YES);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.increment).toHaveBeenCalledWith(
        DAOProposal,
        { id: 'prop-1' },
        'yesVotes',
        1,
      );
      expect(result.yesVotes).toBe(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               getAllProposals                             */
  /* -------------------------------------------------------------------------- */

  describe('getAllProposals', () => {
    it('should exclude WITHDRAWN proposals from default list', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      proposalRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllProposals();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'proposal.status != :withdrawn',
        { withdrawn: ProposalStatus.WITHDRAWN },
      );
    });

    it('should include all statuses when status filter is provided', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      proposalRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllProposals(1, 10, ProposalStatus.WITHDRAWN);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'proposal.status = :status',
        { status: ProposalStatus.WITHDRAWN },
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                 editProposal                               */
  /* -------------------------------------------------------------------------- */

  describe('editProposal', () => {
    const mockProposalWithOwner = {
      ...mockProposal,
      proposerId: 'user-1',
      title: 'Original Title',
      description: 'Original Description',
    };

    it('should successfully edit proposal when user is owner and no votes', async () => {
      proposalRepository.findOne.mockResolvedValue(mockProposalWithOwner);
      proposalRepository.save.mockResolvedValue({
        ...mockProposalWithOwner,
        title: 'Updated Title',
      });

      const result = await service.editProposal('user-1', 'prop-1', {
        title: 'Updated Title',
      });

      expect(proposalRepository.save).toHaveBeenCalledWith({
        ...mockProposalWithOwner,
        title: 'Updated Title',
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      proposalRepository.findOne.mockResolvedValue(mockProposalWithOwner);

      await expect(
        service.editProposal('user-2', 'prop-1', { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when proposal has votes', async () => {
      const proposalWithVotes = {
        ...mockProposalWithOwner,
        yesVotes: 1,
        noVotes: 0,
        abstainVotes: 0,
      };
      proposalRepository.findOne.mockResolvedValue(proposalWithVotes);

      await expect(
        service.editProposal('user-1', 'prop-1', { title: 'New Title' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               withdrawProposal                            */
  /* -------------------------------------------------------------------------- */

  describe('withdrawProposal', () => {
    const mockActiveProposal = {
      ...mockProposal,
      proposerId: 'user-1',
      status: ProposalStatus.ACTIVE,
    };

    it('should successfully withdraw proposal when user is owner and status is ACTIVE', async () => {
      proposalRepository.findOne.mockResolvedValue(mockActiveProposal);
      proposalRepository.save.mockResolvedValue({
        ...mockActiveProposal,
        status: ProposalStatus.WITHDRAWN,
      });

      const result = await service.withdrawProposal('user-1', 'prop-1');

      expect(proposalRepository.save).toHaveBeenCalledWith({
        ...mockActiveProposal,
        status: ProposalStatus.WITHDRAWN,
      });
      expect(result.status).toBe(ProposalStatus.WITHDRAWN);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      proposalRepository.findOne.mockResolvedValue(mockActiveProposal);

      await expect(
        service.withdrawProposal('user-2', 'prop-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when proposal is not ACTIVE', async () => {
      const passedProposal = {
        ...mockActiveProposal,
        status: ProposalStatus.PASSED,
      };
      proposalRepository.findOne.mockResolvedValue(passedProposal);

      await expect(
        service.withdrawProposal('user-1', 'prop-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
