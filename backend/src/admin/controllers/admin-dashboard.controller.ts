import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { Roles } from '../../roles/roles.decorator';
import { UserRole } from '../../roles/roles.enum';
import { RolesGuard } from '../../roles/roles.guard';

@Controller('admin/dashboard')
@UseGuards(RolesGuard)
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('admin/dashboard')
// @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  // Admin Management Endpoints
  @Post()
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminDashboardService.createAdmin(createAdminDto);
  }

  @Patch(':id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminDashboardService.updateAdmin(id, updateAdminDto);
  }

  // Course Management Endpoints
  @Get('courses/statistics')
  async getCourseStatistics() {
    return this.adminDashboardService.getCourseStatistics();
  }

  // User Management Endpoints
  @Get('users/statistics')
  async getUserStatistics() {
    return this.adminDashboardService.getUserStatistics();
  }

  // Payment Tracking Endpoints
  @Get('payments/statistics')
  async getPaymentStatistics() {
    return this.adminDashboardService.getPaymentStatistics();
  }

  @Get('payments/transactions')
  async getRecentTransactions(@Query('limit') limit: number = 10) {
    return this.adminDashboardService.getRecentTransactions(limit);
  }
}
