import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CourseFilterDto } from './dto/course-filter.dto';
import { CoursesService } from './courses.service';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  CourseRegistrationResponseDto,
  EnrollmentStatusResponseDto,
  EnrolledCourseResponseDto,
} from './dto/enrollment-response.dto';
import { Request } from 'express';

type RequestWithUser = Request & {
  user?: { id: string; email: string; role: string };
};

/**
 * When a Bearer token is present, validates it and sets `req.user`;
 * unauthenticated requests proceed without `user`.
 */
@Injectable()
class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers?.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return true;
    }
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      return true;
    }
  }

  override handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
  ): TUser | undefined {
    return user ?? undefined;
  }
}

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new course (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get('enrolled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get courses enrolled by current user' })
  @ApiResponse({
    status: 200,
    description: 'Enrolled courses retrieved successfully',
    type: [EnrolledCourseResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEnrolledCourses(
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<EnrolledCourseResponseDto[]> {
    return this.coursesService.getEnrolledCourses(req.user.id);
  }

  /** @deprecated Use GET /courses/enrolled */
  @Get('registered')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get registered courses (deprecated - use /enrolled)',
  })
  @ApiResponse({
    status: 200,
    description: 'Registered courses retrieved successfully',
    type: [EnrolledCourseResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRegisteredCoursesLegacy(
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<EnrolledCourseResponseDto[]> {
    return this.coursesService.getEnrolledCourses(req.user.id);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get unique tags from published courses' })
  @ApiResponse({
    status: 200,
    description: 'List of unique tags',
    type: [String],
  })
  async getTags(): Promise<string[]> {
    return this.coursesService.getUniqueTags();
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get paginated list of courses' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query() filters: CourseFilterDto,
  ): Promise<{
    data: CourseResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const userId = req.user?.id;
    return this.coursesService.findAllPaginated(page, limit, userId, filters);
  }

  @Get(':id/enrollment-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get enrollment status for a specific course' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment status retrieved successfully',
    type: EnrollmentStatusResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getEnrollmentStatus(
    @Param('id') courseId: string,
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<EnrollmentStatusResponseDto> {
    return this.coursesService.getEnrollmentStatus(req.user.id, courseId);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({
    status: 201,
    description: 'Successfully enrolled in course',
    type: CourseRegistrationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - already enrolled or course full',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async enroll(
    @Param('id') courseId: string,
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<CourseRegistrationResponseDto> {
    return this.coursesService.enroll(req.user.id, courseId);
  }

  @Delete(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Unenroll from a course' })
  @ApiResponse({
    status: 204,
    description: 'Successfully unenrolled from course',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found or not enrolled' })
  async unenroll(
    @Param('id') courseId: string,
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<void> {
    return this.coursesService.unenroll(req.user.id, courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Course details retrieved successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update course details (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a course (admin only)' })
  @ApiResponse({ status: 204, description: 'Course deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.coursesService.remove(id);
  }
}
