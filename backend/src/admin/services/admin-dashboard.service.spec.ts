import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminDashboardService } from './admin-dashboard.service';
import { Admin } from '../entities/admin.entity';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { PasswordHashingService } from '../../common/services/password-hashing.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let adminRepository: Repository<Admin>;
  let passwordHashingService: PasswordHashingService;

  const mockAdmin = {
    id: '1',
    email: 'admin@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPasswordHashingService = {
    hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            create: jest.fn().mockReturnValue(mockAdmin),
            save: jest.fn().mockResolvedValue(mockAdmin),
            findOne: jest.fn().mockResolvedValue(mockAdmin),
          },
        },
        {
          provide: PasswordHashingService,
          useValue: mockPasswordHashingService,
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    passwordHashingService = module.get<PasswordHashingService>(PasswordHashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAdmin', () => {
    it('should create a new admin', async () => {
      const createAdminDto: CreateAdminDto = {
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await service.createAdmin(createAdminDto);

      expect(passwordHashingService.hashPassword).toHaveBeenCalledWith(createAdminDto.password);
      expect(adminRepository.create).toHaveBeenCalledWith({
        ...createAdminDto,
        password: 'hashedPassword',
      });
      expect(adminRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('updateAdmin', () => {
    it('should update an existing admin', async () => {
      const updateAdminDto: UpdateAdminDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = await service.updateAdmin('1', updateAdminDto);

      expect(adminRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(adminRepository.save).toHaveBeenCalledWith(mockAdmin);
      expect(result).toEqual(mockAdmin);
    });

    it('should throw NotFoundException if admin not found', async () => {
      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(null);

      const updateAdminDto: UpdateAdminDto = {
        firstName: 'Jane',
      };

      await expect(service.updateAdmin('1', updateAdminDto)).rejects.toThrow(NotFoundException);
    });

    it('should hash password if provided in update', async () => {
      const updateAdminDto: UpdateAdminDto = {
        password: 'newPassword',
      };

      await service.updateAdmin('1', updateAdminDto);

      expect(passwordHashingService.hashPassword).toHaveBeenCalledWith('newPassword');
    });
  });

  describe('getCourseStatistics', () => {
    it('should return course statistics', async () => {
      const result = await service.getCourseStatistics();

      expect(result).toEqual({
        totalCourses: 0,
        activeCourses: 0,
        enrolledStudents: 0,
      });
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics', async () => {
      const result = await service.getUserStatistics();

      expect(result).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
      });
    });
  });

  describe('getPaymentStatistics', () => {
    it('should return payment statistics', async () => {
      const result = await service.getPaymentStatistics();

      expect(result).toEqual({
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
      });
    });
  });

  describe('getRecentTransactions', () => {
    it('should return recent transactions with default limit', async () => {
      const result = await service.getRecentTransactions();

      expect(result).toEqual([]);
    });

    it('should return recent transactions with custom limit', async () => {
      const result = await service.getRecentTransactions(5);

      expect(result).toEqual([]);
    });
  });
}); 