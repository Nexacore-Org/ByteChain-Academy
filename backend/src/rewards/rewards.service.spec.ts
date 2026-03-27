import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { User } from 'src/users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import {
  RewardHistory,
  XpRewardReason,
} from './entities/reward-history.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { BADGE_MILESTONES } from './badge-milestones';

describe('RewardsService', () => {
  let service: RewardsService;
  let userRepository: {
    findOneOrFail: jest.Mock;
  };
  let rewardHistoryRepository: { count: jest.Mock };
  let badgeRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let userBadgeRepository: {
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOneOrFail: jest.fn(),
    };
    rewardHistoryRepository = {
      count: jest.fn().mockResolvedValue(0),
    };
    badgeRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((x: unknown) => x),
      save: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };
    userBadgeRepository = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((x: unknown) => x),
      save: jest.fn().mockResolvedValue({}),
    };

    dataSource = {
      transaction: jest.fn(async (cb: (m: unknown) => Promise<void>) => {
        const manager = {
          findOne: jest.fn(),
          save: jest.fn(),
          getRepository: jest.fn(() => ({
            create: jest.fn((x: unknown) => x),
            save: jest.fn().mockResolvedValue({}),
          })),
        };
        manager.findOne.mockResolvedValue({
          id: 'user-1',
          xp: 0,
          points: 0,
          lessonsCompleted: 0,
          coursesCompleted: 0,
        });
        await cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(Badge), useValue: badgeRepository },
        {
          provide: getRepositoryToken(UserBadge),
          useValue: userBadgeRepository,
        },
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(RewardHistory),
          useValue: rewardHistoryRepository,
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('awardXP', () => {
    it('merges legacy points into xp, increments xp, and logs history', async () => {
      dataSource.transaction.mockImplementationOnce(async (cb) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue({
            id: 'user-1',
            xp: 0,
            points: 100,
            lessonsCompleted: 0,
            coursesCompleted: 0,
          }),
          save: jest
            .fn()
            .mockImplementation((_entity, u: User) => Promise.resolve(u)),
          getRepository: jest.fn(() => ({
            create: jest.fn((x: unknown) => x),
            save: jest.fn().mockResolvedValue({}),
          })),
        };
        await cb(manager);
        expect(manager.save).toHaveBeenCalledWith(
          User,
          expect.objectContaining({
            xp: 110,
            points: 110,
            lessonsCompleted: 1,
          }),
        );
      });

      userRepository.findOneOrFail.mockResolvedValue({ xp: 110 });

      const result = await service.awardXP(
        'user-1',
        10,
        XpRewardReason.LESSON_COMPLETE,
      );

      expect(result.xp).toBe(110);
      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('checkAndAwardBadges', () => {
    beforeEach(() => {
      badgeRepository.find.mockResolvedValue(
        BADGE_MILESTONES.map((m, i) => ({
          id: `badge-${i}`,
          key: m.key,
          name: m.name,
          description: m.description,
          xpThreshold: m.rule.kind === 'xp' ? m.rule.min : 0,
          iconUrl: m.iconUrl,
        })),
      );
    });

    it('awards xp_500 when user reaches 500 XP', async () => {
      userRepository.findOneOrFail.mockResolvedValue({
        id: 'user-1',
        xp: 500,
        lessonsCompleted: 0,
        coursesCompleted: 0,
      });
      rewardHistoryRepository.count.mockResolvedValue(0);
      userBadgeRepository.find.mockResolvedValue([]);

      const earned = await service.checkAndAwardBadges('user-1');

      expect(earned.map((b) => b.key)).toContain('xp_500');
      expect(userBadgeRepository.save).toHaveBeenCalled();
    });

    it('does not award badges already earned', async () => {
      userRepository.findOneOrFail.mockResolvedValue({
        id: 'user-1',
        xp: 500,
        lessonsCompleted: 10,
        coursesCompleted: 2,
      });
      rewardHistoryRepository.count.mockResolvedValue(1);
      userBadgeRepository.find.mockResolvedValue([
        {
          badgeId: 'badge-xp',
          badge: { key: 'xp_500' },
        },
      ]);
      badgeRepository.find.mockResolvedValue([
        {
          id: 'badge-xp',
          key: 'xp_500',
          name: '500 XP Club',
          description: '',
          xpThreshold: 500,
        },
      ]);

      const earned = await service.checkAndAwardBadges('user-1');

      expect(earned).toHaveLength(0);
    });
  });
});
