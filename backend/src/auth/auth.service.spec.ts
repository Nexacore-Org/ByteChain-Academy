import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { RefreshToken } from './entities/refresh-token.entity';

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  password: 'hashed-password',
  role: UserRole.USER,
  name: 'Test User',
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    validatePassword: jest.Mock;
    createResetToken: jest.Mock;
    resetPassword: jest.Mock;
    incrementFailedLoginAttempts: jest.Mock;
    resetFailedLoginAttempts: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };
  let configService: { get: jest.Mock };
  let emailService: {
    sendWelcomeEmail: jest.Mock;
    sendPasswordResetEmail: jest.Mock;
  };
  let refreshTokenRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
      createResetToken: jest.fn(),
      resetPassword: jest.fn(),
      incrementFailedLoginAttempts: jest.fn(),
      resetFailedLoginAttempts: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-jwt-token') };
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'REFRESH_TOKEN_EXPIRES_IN') return '30';
        if (key === 'CLIENT_URL') return 'http://localhost:3000';
        return undefined;
      }),
    };
    emailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };
    refreshTokenRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* -------------------------------------------------------------------------- */
  /*                                  register                                  */
  /* -------------------------------------------------------------------------- */

  describe('register', () => {
    it('should create a user and return user info with a JWT token', async () => {
      userService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: mockUser.email,
        password: 'plaintext',
        name: mockUser.name,
      });

      expect(userService.create).toHaveBeenCalledWith({
        email: mockUser.email,
        password: 'plaintext',
        name: mockUser.name,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        accessToken: 'signed-jwt-token',
        refreshToken: expect.any(String),
      });
    });

    it('should propagate ConflictException when email is already registered', async () => {
      userService.create.mockRejectedValue(
        new ConflictException('An account with this email already exists'),
      );

      await expect(
        service.register({ email: mockUser.email, password: 'pass' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   login                                    */
  /* -------------------------------------------------------------------------- */

  describe('login', () => {
    it('should return user info and token for valid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      const result = await service.login({
        email: mockUser.email,
        password: 'correct-password',
      });

      expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        'correct-password',
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        accessToken: 'signed-jwt-token',
        refreshToken: expect.any(String),
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'anything' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));

      expect(userService.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong-password' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should increment failed login attempts on wrong password', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userService.incrementFailedLoginAttempts).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    it('should throw UnauthorizedException with minutes remaining when account is locked', async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 15 * 60000), // 15 minutes from now
      };
      userService.findByEmail.mockResolvedValue(lockedUser);

      await expect(
        service.login({ email: mockUser.email, password: 'any-password' }),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Account is temporarily locked. Please try again in 15 minute(s).',
        ),
      );

      expect(userService.validatePassword).not.toHaveBeenCalled();
    });

    it('should reset failed login attempts on successful login', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      await service.login({
        email: mockUser.email,
        password: 'correct-password',
      });

      expect(userService.resetFailedLoginAttempts).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               forgotPassword                               */
  /* -------------------------------------------------------------------------- */

  describe('forgotPassword', () => {
    it('should return a message and send a password reset email', async () => {
      userService.createResetToken.mockResolvedValue('raw-reset-token-abc123');

      const result = await service.forgotPassword({ email: mockUser.email });

      expect(userService.createResetToken).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual({
        message: 'Password reset link sent to your email',
      });
    });

    it('should propagate NotFoundException when email is not found', async () => {
      userService.createResetToken.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        service.forgotPassword({ email: 'ghost@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               resetPassword                                */
  /* -------------------------------------------------------------------------- */

  describe('resetPassword', () => {
    it('should reset the password and return a success message', async () => {
      userService.resetPassword.mockResolvedValue(undefined);

      const result = await service.resetPassword({
        email: mockUser.email,
        token: 'valid-token',
        newPassword: 'new-secure-password',
      });

      expect(userService.resetPassword).toHaveBeenCalledWith(
        mockUser.email,
        'valid-token',
        'new-secure-password',
      );
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should propagate UnauthorizedException for invalid or expired token', async () => {
      userService.resetPassword.mockRejectedValue(
        new UnauthorizedException('Invalid or expired reset token'),
      );

      await expect(
        service.resetPassword({
          email: mockUser.email,
          token: 'expired-token',
          newPassword: 'newpass',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
