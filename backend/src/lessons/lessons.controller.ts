import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new lesson (admin only)' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully', type: LessonResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  async create(
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<LessonResponseDto> {
    const lesson = await this.lessonsService.create(createLessonDto);
    return new LessonResponseDto(lesson);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of lessons' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  async findAll(@Query() pagination: PaginationDto): Promise<{
    data: LessonResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const result = await this.lessonsService.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((lesson) => new LessonResponseDto(lesson)),
    };
  }

  // NOTE: /course/:courseId must be declared BEFORE /:id to avoid shadowing
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get lessons for a specific course' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query() pagination: PaginationDto,
  ): Promise<{
    data: LessonResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const result = await this.lessonsService.findAllByCoursePaginated(
      courseId,
      page,
      limit,
    );
    return {
      ...result,
      data: result.data.map((lesson) => new LessonResponseDto(lesson)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson details by ID' })
  @ApiResponse({ status: 200, description: 'Lesson details retrieved successfully', type: LessonResponseDto })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOne(@Param('id') id: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonsService.findOneWithQuizFlag(id);
    return new LessonResponseDto(lesson);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update lesson details (admin only)' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully', type: LessonResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    const lesson = await this.lessonsService.update(id, updateLessonDto);
    return new LessonResponseDto(lesson);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a lesson (admin only)' })
  @ApiResponse({ status: 204, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.lessonsService.remove(id);
  }
}
