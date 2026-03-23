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
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CoursesService } from './courses.service';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

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

  @Get()
  async findAll(
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
    return this.coursesService.findAllPaginated(page, limit);
  }

  @Get('registered')
  @UseGuards(JwtAuthGuard)
  async findUserCourses(@Req() req): Promise<CourseResponseDto[]> {
    return this.coursesService.findUserCourses(req.user.id);
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

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async enroll(
    @Param('id') courseId: string,
    @Req() req,
  ): Promise<{ message: string }> {
    await this.coursesService.enrollUser(req.user.id, courseId);
    return { message: 'Successfully enrolled in course' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.coursesService.remove(id);
  }
}
