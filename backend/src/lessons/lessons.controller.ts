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
import { LessonsService } from './lessons.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<LessonResponseDto> {
    const lesson = await this.lessonsService.create(createLessonDto);
    return new LessonResponseDto(lesson);
  }

  @Get()
  async findAll(
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
    const result = await this.lessonsService.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((lesson) => new LessonResponseDto(lesson)),
    };
  }

  @Get('course/:courseId')
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
  async findOne(@Param('id') id: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonsService.findOne(id);
    return new LessonResponseDto(lesson);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  async remove(@Param('id') id: string): Promise<void> {
    await this.lessonsService.remove(id);
  }
}
