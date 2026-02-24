import { Test, TestingModule } from '@nestjs/testing';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

describe('RewardsController', () => {
  let controller: RewardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardsController],
      providers: [
        { provide: RewardsService, useValue: { getEarnedBadges: jest.fn(), updateProgressAndAwardBadges: jest.fn() } },
      ],
    }).compile();

    controller = module.get<RewardsController>(RewardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
