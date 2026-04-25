import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { Certificate } from '../certificates/entities/certificate.entity';
import { UserBadge } from '../rewards/entities/user-badge.entity';
import { CourseRegistration } from '../courses/entities/course-registration.entity';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Certificate),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserBadge),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CourseRegistration),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
