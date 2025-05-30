import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = { id: '1', email: 'admin@example.com', role: 'ADMIN' };
  const mockTokens = {
    accessToken: 'access',
    refreshToken: 'refresh',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn().mockResolvedValue(mockUser),
            generateTokens: jest.fn().mockResolvedValue(mockTokens),
            refresh: jest.fn().mockResolvedValue({
              accessToken: 'new-access',
              refreshToken: 'new-refresh',
            }), // <-- fix here
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should login and return tokens with user', async () => {
    const result = await controller.login(
      'admin@example.com',
      'password123',
      'ADMIN',
    );
    expect(result).toEqual(mockTokens);
    expect(authService.validateUser).toHaveBeenCalledWith(
      'admin@example.com',
      'password123',
      'ADMIN',
    );
  });

  it('should refresh tokens', async () => {
    const result = await controller.refresh('refresh-token');
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
  });

  it('should logout', async () => {
    const result = await controller.logout('refresh-token');
    expect(result).toEqual({ message: 'Logged out' });
    expect(authService.logout).toHaveBeenCalledWith('refresh-token');
  });
});
