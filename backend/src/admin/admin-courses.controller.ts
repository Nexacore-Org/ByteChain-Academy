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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CoursesService } from '../courses/courses.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';
import { CourseResponseDto } from '../courses/dto/course-response.dto';

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    return this.coursesService.findAllPaginated(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
