import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { UserRole } from './entities/user.entity';
import { WalletService } from './wallet.service';

const mockProfileResponse = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  role: UserRole.USER,
  walletAddress: null,
  xp: 100,
  streak: 3,
  bio: null,
  avatarUrl: null,
  createdAt: new Date('2024-01-01'),
};

const mockRequest = { user: { id: 'user-1' } };

describe('UsersController', () => {
  let controller: UsersController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      getMyProfile: jest.fn(),
      updateProfile: jest.fn(),
      getMyStats: jest.fn(),
      getPublicProfile: jest.fn(),
      deleteProfile: jest.fn(),
    };
    const mockWalletService = {
      generateChallenge: jest.fn(),
      verifyAndLink: jest.fn(),
      getStatus: jest.fn(),
      unlink: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: WalletService, useValue: mockWalletService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /me', () => {
    it('returns the current user profile', async () => {
      userService.getMyProfile.mockResolvedValue(mockProfileResponse);

      const result = await controller.getMyProfile(mockRequest);

      expect(userService.getMyProfile).toHaveBeenCalledWith('user-1');
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('PATCH /me', () => {
    it('returns updated profile after updating username and bio', async () => {
      const updated = {
        ...mockProfileResponse,
        username: 'newname',
        bio: 'new bio',
      };
      userService.updateProfile.mockResolvedValue(updated as any);

      const result = await controller.updateProfile(mockRequest, {
        username: 'newname',
        bio: 'new bio',
      });

      expect(userService.updateProfile).toHaveBeenCalledWith('user-1', {
        username: 'newname',
        bio: 'new bio',
      });
      expect(result).toBeUndefined();
    });

    it('partial update with only username leaves other fields unchanged', async () => {
      const updated = { ...mockProfileResponse, username: 'onlyname' };
      userService.updateProfile.mockResolvedValue(updated as any);

      const result = await controller.updateProfile(mockRequest, {
        username: 'onlyname',
      });

      expect(userService.updateProfile).toHaveBeenCalledWith('user-1', {
        username: 'onlyname',
      });
      expect(result).toBeUndefined();
    });

    it('partial update with only bio leaves other fields unchanged', async () => {
      const updated = { ...mockProfileResponse, bio: 'only bio' };
      userService.updateProfile.mockResolvedValue(updated as any);

      const result = await controller.updateProfile(mockRequest, {
        bio: 'only bio',
      });

      expect(userService.updateProfile).toHaveBeenCalledWith('user-1', {
        bio: 'only bio',
      });
      expect(result).toBeUndefined();
    });
  });

  describe('POST /me/avatar', () => {
    const validFile = {
      size: 1024,
      mimetype: 'image/png',
      originalname: 'avatar.png',
      buffer: Buffer.from('fake-image'),
    };

    it('returns avatarUrl on successful upload', async () => {
      userService.uploadAvatar = jest.fn().mockResolvedValue({
        avatarUrl: '/uploads/avatars/uuid.png',
      });

      const result = await controller.uploadMyAvatar(mockRequest, validFile as any);

      expect(userService.uploadAvatar).toHaveBeenCalledWith(
        'user-1',
        validFile,
      );
      expect(result).toEqual({ avatarUrl: '/uploads/avatars/uuid.png' });
    });

    it('propagates BadRequestException from service for non-image files', async () => {
      userService.uploadAvatar = jest.fn().mockRejectedValue(
        new BadRequestException('Only image files are allowed'),
      );
      const nonImageFile = { ...validFile, mimetype: 'application/pdf' };

      await expect(
        controller.uploadMyAvatar(mockRequest, nonImageFile as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('propagates BadRequestException from service for oversized files', async () => {
      userService.uploadAvatar = jest.fn().mockRejectedValue(
        new BadRequestException('Avatar file size must be <= 2MB'),
      );
      const largeFile = { ...validFile, size: 999 * 1024 * 1024 };

      await expect(
        controller.uploadMyAvatar(mockRequest, largeFile as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
