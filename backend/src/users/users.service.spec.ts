import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('incrementFailedLoginAttempts', () => {
    it('should increment failed login attempts without lockout when below threshold', async () => {
      const mockUser = {
        id: 'user-1',
        failedLoginAttempts: 3,
        lockedUntil: null,
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, failedLoginAttempts: 4 });

      await service.incrementFailedLoginAttempts('user-1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should set 15 minute lockout at 5 failed attempts', async () => {
      const mockUser = {
        id: 'user-1',
        failedLoginAttempts: 4,
        lockedUntil: null,
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      await service.incrementFailedLoginAttempts('user-1');

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginAttempts: 5,
          lockedUntil: expect.any(Date),
        }),
      );
    });

    it('should set 60 minute lockout at 10 failed attempts', async () => {
      const mockUser = {
        id: 'user-1',
        failedLoginAttempts: 9,
        lockedUntil: null,
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      await service.incrementFailedLoginAttempts('user-1');

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginAttempts: 10,
          lockedUntil: expect.any(Date),
        }),
      );
    });
  });

  describe('resetFailedLoginAttempts', () => {
    it('should reset failed login attempts and lockedUntil', async () => {
      mockUserRepository.update.mockResolvedValue(undefined);

      await service.resetFailedLoginAttempts('user-1');

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {
        failedLoginAttempts: 0,
        lockedUntil: null,
      });
    });
  });
});
