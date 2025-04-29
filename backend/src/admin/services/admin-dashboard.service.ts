import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { PasswordHashingService } from '../../tutor/services/password.hashing.service';
import { PasswordHashingService } from 'src/tutor/services/password.hashing.service';
// import { PasswordHashingService } from '../../common/services/password-hashing.service';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  // Admin Management Methods
  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const hashedPassword = await this.passwordHashingService.hashPassword(
      createAdminDto.password,
    );

    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });

    return this.adminRepository.save(admin);
  }

  async updateAdmin(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (updateAdminDto.password) {
      updateAdminDto.password = await this.passwordHashingService.hashPassword(
        updateAdminDto.password,
      );
    }

    Object.assign(admin, updateAdminDto);
    return this.adminRepository.save(admin);
  }

  // Course Management Methods
  getCourseStatistics(): Promise<{
    totalCourses: number;
    activeCourses: number;
    enrolledStudents: number;
  }> {
    // TODO: Implement course statistics
    return Promise.resolve({
      totalCourses: 0,
      activeCourses: 0,
      enrolledStudents: 0,
    });
  }

  // User Management Methods
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    // Simulate fetching user statistics from a database
    const userStats = await Promise.resolve({
      totalUsers: 100,
      activeUsers: 80,
      newUsersThisMonth: 20,
    });

    return userStats;
  }

  // Payment Tracking Methods
  async getPaymentStatistics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }> {
    // Simulate fetching payment statistics from a database
    const paymentStats = await Promise.resolve({
      totalRevenue: 10000,
      monthlyRevenue: 2000,
      pendingPayments: 5,
    });

    return paymentStats;
  }

  async getRecentTransactions(limit: number = 10): Promise<any[]> {
    // Simulate fetching recent transactions from a database
    const transactions = await Promise.resolve([
      { id: 1, amount: 100, date: '2023-01-01' },
      { id: 2, amount: 200, date: '2023-01-02' },
    ]);

    return transactions.slice(0, limit);
  }
}
