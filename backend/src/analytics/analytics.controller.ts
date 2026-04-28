import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  @ApiResponse({
    status: 200,
    description: 'Analytics overview retrieved successfully',
    type: AnalyticsOverviewDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getOverview(): Promise<AnalyticsOverviewDto> {
    return this.analyticsService.getOverview();
  }

  @Get('course-performance')
  @ApiOperation({ summary: 'Get course performance analytics' })
  @ApiResponse({
    status: 200,
    description: 'Course performance data retrieved successfully',
    type: [CoursePerformanceDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getCoursePerformance(): Promise<CoursePerformanceDto[]> {
    return this.analyticsService.getCoursePerformance();
  }

  @Get('learner-activity')
  @ApiOperation({ summary: 'Get learner activity analytics' })
  @ApiResponse({
    status: 200,
    description: 'Learner activity data retrieved successfully',
    type: [LearnerActivityPointDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getLearnerActivity(): Promise<LearnerActivityPointDto[]> {
    return this.analyticsService.getLearnerActivity();
  }

  @Get('top-learners')
  @ApiOperation({ summary: 'Get top learners analytics' })
  @ApiResponse({
    status: 200,
    description: 'Top learners data retrieved successfully',
    type: [TopLearnerDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getTopLearners(): Promise<TopLearnerDto[]> {
    return this.analyticsService.getTopLearners();
  }
}
