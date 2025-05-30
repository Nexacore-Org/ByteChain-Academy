import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../roles/roles.enum';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let adminRepo: Repository<Admin>;
  let refreshTokenRepo: Repository<RefreshToken>;
  let mockAdmin: Admin;
  let mockRefreshToken: RefreshToken;

  beforeEach(async () => {
    mockAdmin = {
      id: '1',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRefreshToken = {
      id: 'token-id',
      token: 'refresh-token',
      user: mockAdmin,
      expiresAt: new Date(Date.now() + 100000),
      revoked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockAdmin),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminRepo = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    refreshTokenRepo = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
  });

  it('should validate user with correct credentials', async () => {
    const user = await service.validateUser(
      'admin@example.com',
      'password123',
      UserRole.ADMIN,
    );
    expect(user).toBeDefined();
    expect(user?.email).toBe('admin@example.com');
  });

  it('should return null for invalid password', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
    const user = await service.validateUser(
      'admin@example.com',
      'wrong',
      UserRole.ADMIN,
    );
    expect(user).toBeNull();
  });

  it('should generate tokens', async () => {
    const tokens = await service.generateTokens(mockAdmin);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('should refresh token and revoke old one', async () => {
    jest
      .spyOn(jwt, 'verify')
      .mockReturnValue({ sub: mockAdmin.id, role: mockAdmin.role } as any);
    jest
      .spyOn(refreshTokenRepo, 'findOne')
      .mockResolvedValue({ ...mockRefreshToken, revoked: false });
    jest
      .spyOn(refreshTokenRepo, 'save')
      .mockResolvedValue({ ...mockRefreshToken, revoked: true });

    const tokens = await service.refresh('refresh-token');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('should throw on invalid refresh token', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error();
    });
    await expect(service.refresh('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should revoke token on logout', async () => {
    jest.spyOn(refreshTokenRepo, 'findOne').mockResolvedValue(mockRefreshToken);
    jest
      .spyOn(refreshTokenRepo, 'save')
      .mockResolvedValue({ ...mockRefreshToken, revoked: true });
    await service.logout('refresh-token');
    expect(refreshTokenRepo.save).toHaveBeenCalledWith({
      ...mockRefreshToken,
      revoked: true,
    });
  });
});
