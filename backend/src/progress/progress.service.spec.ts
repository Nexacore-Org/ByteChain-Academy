import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { Progress } from './entities/progress.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { CertificateService } from 'src/certificates/certificates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { RewardsService } from 'src/rewards/rewards.service';

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(Progress),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: { count: jest.fn() },
        },
        {
          provide: CertificateService,
          useValue: { issueCertificateForCourse: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: { createNotification: jest.fn() },
        },
        {
          provide: RewardsService,
          useValue: { awardXP: jest.fn().mockResolvedValue({ xp: 0 }) },
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
