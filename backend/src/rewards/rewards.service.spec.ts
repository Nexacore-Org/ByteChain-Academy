import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { User } from 'src/users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { RewardHistory } from './entities/reward-history.entity';

const mockRepo = () => ({ findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() });

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        { provide: getRepositoryToken(Badge), useValue: mockRepo() },
        { provide: getRepositoryToken(UserBadge), useValue: mockRepo() },
        { provide: getRepositoryToken(User), useValue: mockRepo() },
        { provide: getRepositoryToken(RewardHistory), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
