import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsOverviewDto,
  CoursePerformanceDto,
  LearnerActivityPointDto,
  TopLearnerDto,
} from './dto/analytics-response.dto';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(): Promise<AnalyticsOverviewDto> {
    return this.analyticsService.getOverview();
  }

  @Get('course-performance')
  async getCoursePerformance(): Promise<CoursePerformanceDto[]> {
    return this.analyticsService.getCoursePerformance();
  }

  @Get('learner-activity')
  async getLearnerActivity(): Promise<LearnerActivityPointDto[]> {
    return this.analyticsService.getLearnerActivity();
  }

  @Get('top-learners')
  async getTopLearners(): Promise<TopLearnerDto[]> {
    return this.analyticsService.getTopLearners();
  }
}
