import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { User } from './entities/user.entity';

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
          },
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
  });
});
