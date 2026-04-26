import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from '../courses/courses.service';
import { LessonsService } from '../lessons/lessons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';
import { CourseResponseDto } from '../courses/dto/course-response.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { PaginatedResult } from '../common/services/pagination.service';

@ApiTags('Admin — Courses')
@ApiBearerAuth('access-token')
@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly lessonsService: LessonsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all courses with optional search & status filter (admin)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['published', 'draft', ''],
  })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: 'published' | 'draft' | '',
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<PaginatedResult<CourseResponseDto>> {
    return this.coursesService.findAllAdmin(
      Number(page),
      Number(limit),
      search,
      status,
      includeDeleted === 'true',
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course (admin)' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course by ID (admin)' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course by ID (admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted course by ID (admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async restore(@Param('id') id: string): Promise<void> {
    return this.coursesService.restore(id);
  }

  @Patch(':id/lessons/reorder')
  @ApiOperation({ summary: 'Reorder lessons within a course (admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderLessons(
    @Param('id') courseId: string,
    @Body() body: ReorderLessonsDto,
  ): Promise<void> {
    return this.lessonsService.reorderLessons(courseId, body.orderedIds);
  }
}
