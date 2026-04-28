import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { Certificate } from '../certificates/entities/certificate.entity';
import { UserBadge } from '../rewards/entities/user-badge.entity';
import { CourseRegistration } from '../courses/entities/course-registration.entity';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  password: 'hashed',
  role: UserRole.USER,
  bio: null,
  avatarUrl: null,
  walletAddress: null,
  xp: 100,
  points: 100,
  streak: 3,
  coursesCompleted: 2,
  resetToken: null,
  resetTokenExpires: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as unknown as User;

const makeRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepo: ReturnType<typeof makeRepo>;
  let certificateRepo: ReturnType<typeof makeRepo>;
  let userBadgeRepo: ReturnType<typeof makeRepo>;
  let courseRegistrationRepo: ReturnType<typeof makeRepo>;

  beforeEach(async () => {
    userRepo = makeRepo();
    certificateRepo = makeRepo();
    userBadgeRepo = makeRepo();
    courseRegistrationRepo = makeRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Certificate), useValue: certificateRepo },
        { provide: getRepositoryToken(UserBadge), useValue: userBadgeRepo },
        {
          provide: getRepositoryToken(CourseRegistration),
          useValue: courseRegistrationRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw on wrong password', async () => {
    await expect(
      service.deleteProfile(user.id, 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should anonymise user on correct password', async () => {
    await service.deleteProfile(user.id, validPassword);

    const updated = await repo.findOne({ where: { id: user.id } });

    expect(updated.email).toMatch(/^deleted-.*@bytechain\.invalid$/);
    expect(updated.name).toBe('Deleted User');
    expect(updated.username).toBeNull();
  });

  it('should prevent login after deletion', async () => {
    await service.deleteProfile(user.id, validPassword);

    await expect(
      authService.validateUser(user.email, validPassword),
    ).rejects.toThrow();
  describe('updateProfile', () => {
    it('updates username and bio when both are provided', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser });
      userRepo.save.mockImplementation((u: User) => Promise.resolve(u));

      const result = await service.updateProfile('user-1', {
        username: 'newname',
        bio: 'new bio',
      });

      expect(result.username).toBe('newname');
      expect(result.bio).toBe('new bio');
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('only updates username when bio is omitted', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, bio: 'original bio' });
      userRepo.save.mockImplementation((u: User) => Promise.resolve(u));

      const result = await service.updateProfile('user-1', {
        username: 'onlyname',
      });

      expect(result.username).toBe('onlyname');
      expect(result.bio).toBe('original bio');
    });

    it('only updates bio when username is omitted', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser });
      userRepo.save.mockImplementation((u: User) => Promise.resolve(u));

      const result = await service.updateProfile('user-1', { bio: 'only bio' });

      expect(result.bio).toBe('only bio');
      expect(result.username).toBe('testuser');
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', { username: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    const validFile = {
      size: 1024,
      mimetype: 'image/png',
      originalname: 'avatar.png',
      buffer: Buffer.from('fake-image'),
    };

    it('throws BadRequestException when file is undefined', async () => {
      await expect(
        service.uploadAvatar('user-1', undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when file size exceeds limit', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser });
      const oversizedFile = {
        ...validFile,
        size: 999 * 1024 * 1024,
      };

      await expect(
        service.uploadAvatar('user-1', oversizedFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for non-image mimetype', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser });
      const nonImageFile = { ...validFile, mimetype: 'application/pdf' };

      await expect(
        service.uploadAvatar('user-1', nonImageFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyProfile', () => {
    it('returns profile with resolved xp', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser });

      const profile = await service.getMyProfile('user-1');

      expect(profile.id).toBe('user-1');
      expect(profile.email).toBe('test@example.com');
      expect(profile.xp).toBeGreaterThanOrEqual(0);
    });

    it('throws NotFoundException for unknown user', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getMyProfile('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
