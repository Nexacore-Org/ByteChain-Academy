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
import { AuthGuard } from '@nestjs/passport';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
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

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get('enrolled')
  @UseGuards(JwtAuthGuard)
  async getEnrolledCourses(
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<EnrolledCourseResponseDto[]> {
    return this.coursesService.getEnrolledCourses(req.user.id);
  }

  /** @deprecated Use GET /courses/enrolled */
  @Get('registered')
  @UseGuards(JwtAuthGuard)
  async getRegisteredCoursesLegacy(
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<EnrolledCourseResponseDto[]> {
    return this.coursesService.getEnrolledCourses(req.user.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Req() req: RequestWithUser,
    @Query() pagination: PaginationDto,
  ): Promise<{
    data: CourseResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const userId = req.user?.id;
    return this.coursesService.findAllPaginated(page, limit, userId);
  }

  @Get(':id/enrollment-status')
  @UseGuards(JwtAuthGuard)
  async getEnrollmentStatus(
    @Param('id') courseId: string,
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<EnrollmentStatusResponseDto> {
    return this.coursesService.getEnrollmentStatus(req.user.id, courseId);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async enroll(
    @Param('id') courseId: string,
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<CourseRegistrationResponseDto> {
    return this.coursesService.enroll(req.user.id, courseId);
  }

  @Delete(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unenroll(
    @Param('id') courseId: string,
    @Req() req: RequestWithUser & { user: { id: string } },
  ): Promise<void> {
    return this.coursesService.unenroll(req.user.id, courseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  async remove(@Param('id') id: string): Promise<void> {
    await this.coursesService.remove(id);
  }
}
