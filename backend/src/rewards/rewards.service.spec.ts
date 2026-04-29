import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { User } from '../users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import {
  RewardHistory,
  XpRewardReason,
} from './entities/reward-history.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { BADGE_MILESTONES } from './badge-milestones';
import { WebhooksService } from '../webhooks/webhooks.service';

describe('RewardsService', () => {
  let service: RewardsService;
  let userRepository: {
    findOneOrFail: jest.Mock;
    find: jest.Mock;
  };
  let rewardHistoryRepository: { count: jest.Mock; find: jest.Mock };
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
    createQueryBuilder: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOneOrFail: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };
    rewardHistoryRepository = {
      count: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockResolvedValue([]),
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
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }),
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
        {
          provide: WebhooksService,
          useValue: {
            dispatchEvent: jest.fn().mockResolvedValue(undefined),
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
    const allBadgeMocks = BADGE_MILESTONES.map((m, i) => ({
      id: `badge-${i}`,
      key: m.key,
      name: m.name,
      description: m.description,
      xpThreshold: m.rule.kind === 'xp' ? m.rule.min : 0,
      iconUrl: m.iconUrl,
    }));

    beforeEach(() => {
      badgeRepository.find.mockResolvedValue(allBadgeMocks);
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

    it('awards first_lesson badge when user completed 1 lesson', async () => {
      userRepository.findOneOrFail.mockResolvedValue({
        id: 'user-1',
        xp: 10,
        lessonsCompleted: 1,
        coursesCompleted: 0,
      });
      rewardHistoryRepository.count.mockResolvedValue(0);
      userBadgeRepository.find.mockResolvedValue([]);

      const earned = await service.checkAndAwardBadges('user-1');

      expect(earned.map((b) => b.key)).toContain('first_lesson');
    });

    it('awards first_quiz_pass badge when user has 1 quiz pass in history', async () => {
      userRepository.findOneOrFail.mockResolvedValue({
        id: 'user-1',
        xp: 25,
        lessonsCompleted: 0,
        coursesCompleted: 0,
      });
      rewardHistoryRepository.count.mockResolvedValue(1); // 1 quiz pass
      userBadgeRepository.find.mockResolvedValue([]);

      const earned = await service.checkAndAwardBadges('user-1');

      expect(earned.map((b) => b.key)).toContain('first_quiz_pass');
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

  /* -------------------------------------------------------------------------- */
  /*                                getLeaderboard                              */
  /* -------------------------------------------------------------------------- */

  describe('getLeaderboard', () => {
    it('should return top users sorted by XP descending', async () => {
      userRepository.find = jest.fn().mockResolvedValue([
        { id: 'u1', username: 'alice', name: null, xp: 500 },
        { id: 'u2', username: null, name: 'Bob', xp: 300 },
        { id: 'u3', username: null, name: null, xp: 100 },
      ]);
      userBadgeRepository.createQueryBuilder = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { userId: 'u1', count: '3' },
          { userId: 'u2', count: '1' },
        ]),
      });

      const result = await service.getLeaderboard();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'username', 'name', 'xp'],
        order: { xp: 'DESC' },
        take: 10,
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        rank: 1,
        username: 'alice',
        xp: 500,
        badgesCount: 3,
      });
      expect(result[1]).toEqual({
        rank: 2,
        username: 'Bob',
        xp: 300,
        badgesCount: 1,
      });
      expect(result[2]).toEqual({
        rank: 3,
        username: null,
        xp: 100,
        badgesCount: 0,
      });
    });

    it('should treat null xp as 0', async () => {
      userRepository.find = jest
        .fn()
        .mockResolvedValue([
          { id: 'u1', username: 'charlie', name: null, xp: null },
        ]);

      const result = await service.getLeaderboard();

      expect(result[0].xp).toBe(0);
      expect(result[0].rank).toBe(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                getMyRewards                                */
  /* -------------------------------------------------------------------------- */

  describe('getMyRewards', () => {
    it('should return xp, earned badges, and recent history with labels', async () => {
      const mockBadge = {
        id: 'badge-1',
        key: 'first_lesson',
        name: 'First Lesson',
      };
      const mockHistory = [
        {
          id: 'hist-1',
          userId: 'user-1',
          amount: 10,
          reason: XpRewardReason.LESSON_COMPLETE,
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'hist-2',
          userId: 'user-1',
          amount: 25,
          reason: XpRewardReason.QUIZ_PASS,
          createdAt: new Date('2025-01-02'),
        },
      ];

      userRepository.findOneOrFail.mockResolvedValue({ xp: 35 });
      userBadgeRepository.find.mockResolvedValue([
        { badge: mockBadge, awardedAt: new Date() },
      ]);
      rewardHistoryRepository.find = jest.fn().mockResolvedValue(mockHistory);

      const result = await service.getMyRewards('user-1');

      expect(result.xp).toBe(35);
      expect(result.badges).toHaveLength(1);
      expect(result.badges[0].badge.key).toBe('first_lesson');
      expect(result.recentHistory).toHaveLength(2);
      expect(result.recentHistory[0]).toEqual({
        amount: 10,
        reason: XpRewardReason.LESSON_COMPLETE,
        label: 'Completed a lesson',
        createdAt: mockHistory[0].createdAt,
      });
      expect(result.recentHistory[1]).toEqual({
        amount: 25,
        reason: XpRewardReason.QUIZ_PASS,
        label: 'Passed a quiz',
        createdAt: mockHistory[1].createdAt,
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               getEarnedBadges                              */
  /* -------------------------------------------------------------------------- */

  describe('getEarnedBadges', () => {
    it('should return badges with awardedAt timestamps', async () => {
      const awardedAt = new Date('2025-01-01');
      const mockBadge = {
        id: 'badge-1',
        key: 'first_lesson',
        name: 'First Lesson',
      };
      userBadgeRepository.find.mockResolvedValue([
        { badge: mockBadge, awardedAt },
      ]);

      const result = await service.getEarnedBadges('user-1');

      expect(userBadgeRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: { badge: true },
        order: { awardedAt: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].badge.key).toBe('first_lesson');
      expect(result[0].awardedAt).toBe(awardedAt);
    });

    it('should return empty array when user has no badges', async () => {
      userBadgeRepository.find.mockResolvedValue([]);

      const result = await service.getEarnedBadges('user-1');

      expect(result).toHaveLength(0);
    });
  });
});
