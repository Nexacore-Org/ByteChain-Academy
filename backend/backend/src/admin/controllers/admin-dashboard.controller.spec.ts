import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';

describe('AdminDashboardController', () => {
  let controller: AdminDashboardController;
  let service: AdminDashboardService;

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

  const mockAdminDashboardService = {
    createAdmin: jest.fn().mockResolvedValue(mockAdmin),
    updateAdmin: jest.fn().mockResolvedValue(mockAdmin),
    getCourseStatistics: jest.fn().mockResolvedValue({
      totalCourses: 0,
      activeCourses: 0,
      enrolledStudents: 0,
    }),
    getUserStatistics: jest.fn().mockResolvedValue({
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
    }),
    getPaymentStatistics: jest.fn().mockResolvedValue({
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingPayments: 0,
    }),
    getRecentTransactions: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
      providers: [
        {
          provide: AdminDashboardService,
          useValue: mockAdminDashboardService,
        },
      ],
    }).compile();

    controller = module.get<AdminDashboardController>(AdminDashboardController);
    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAdmin', () => {
    it('should create a new admin', async () => {
      const createAdminDto: CreateAdminDto = {
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await controller.createAdmin(createAdminDto);

      expect(service.createAdmin).toHaveBeenCalledWith(createAdminDto);
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('updateAdmin', () => {
    it('should update an existing admin', async () => {
      const updateAdminDto: UpdateAdminDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = await controller.updateAdmin('1', updateAdminDto);

      expect(service.updateAdmin).toHaveBeenCalledWith('1', updateAdminDto);
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('getCourseStatistics', () => {
    it('should return course statistics', async () => {
      const result = await controller.getCourseStatistics();

      expect(service.getCourseStatistics).toHaveBeenCalled();
      expect(result).toEqual({
        totalCourses: 0,
        activeCourses: 0,
        enrolledStudents: 0,
      });
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics', async () => {
      const result = await controller.getUserStatistics();

      expect(service.getUserStatistics).toHaveBeenCalled();
      expect(result).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
      });
    });
  });

  describe('getPaymentStatistics', () => {
    it('should return payment statistics', async () => {
      const result = await controller.getPaymentStatistics();

      expect(service.getPaymentStatistics).toHaveBeenCalled();
      expect(result).toEqual({
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
      });
    });
  });

  describe('getRecentTransactions', () => {
    it('should return recent transactions with default limit', async () => {
      const result = await controller.getRecentTransactions();

      expect(service.getRecentTransactions).toHaveBeenCalledWith(10);
      expect(result).toEqual([]);
    });

    it('should return recent transactions with custom limit', async () => {
      const result = await controller.getRecentTransactions(5);

      expect(service.getRecentTransactions).toHaveBeenCalledWith(5);
      expect(result).toEqual([]);
    });
  });
}); 