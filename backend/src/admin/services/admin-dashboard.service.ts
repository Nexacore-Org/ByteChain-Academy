import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
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

  async updateAdmin(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
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
  async getCourseStatistics(): Promise<{
    totalCourses: number;
    activeCourses: number;
    enrolledStudents: number;
  }> {
    // TODO: Implement course statistics
    return {
      totalCourses: 0,
      activeCourses: 0,
      enrolledStudents: 0,
    };
  }

  // User Management Methods
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    // TODO: Implement user statistics
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
    };
  }

  // Payment Tracking Methods
  async getPaymentStatistics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
  }> {
    // TODO: Implement payment statistics
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingPayments: 0,
    };
  }

  async getRecentTransactions(limit: number = 10): Promise<any[]> {
    // TODO: Implement recent transactions
    return [];
  }
} 