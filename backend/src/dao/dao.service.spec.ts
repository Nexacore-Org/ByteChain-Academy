import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DAOService } from './dao.service';
import { DAOProposal, ProposalStatus } from './entities/dao-proposal.entity';
import { DAOVote, VoteType } from './entities/dao-vote.entity';
import { User } from '../users/entities/user.entity';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

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
      await expect(service.castVote('user-1', 'invalid', VoteType.YES)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if proposal is not ACTIVE', async () => {
      proposalRepository.findOne.mockResolvedValue({ ...mockProposal, status: ProposalStatus.PASSED });
      await expect(service.castVote('user-1', 'prop-1', VoteType.YES)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if deadline has passed', async () => {
      proposalRepository.findOne.mockResolvedValue({ ...mockProposal, votingDeadline: new Date(Date.now() - 1000) });
      await expect(service.castVote('user-1', 'prop-1', VoteType.YES)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if user already voted', async () => {
      proposalRepository.findOne.mockResolvedValue(mockProposal);
      voteRepository.findOne.mockResolvedValue({ id: 'vote-1' });
      await expect(service.castVote('user-1', 'prop-1', VoteType.YES)).rejects.toThrow(ConflictException);
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
      
      dataSource.transaction.mockImplementation(cb => cb(mockManager));

      const result = await service.castVote('user-1', 'prop-1', VoteType.YES);
      
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.increment).toHaveBeenCalledWith(DAOProposal, { id: 'prop-1' }, 'yesVotes', 1);
      expect(result.yesVotes).toBe(1);
    });
  });
});
