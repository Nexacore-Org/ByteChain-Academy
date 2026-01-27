import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req, Query } from '@nestjs/common';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto, UpdateCourseDto, CourseResponseDto } from '../dto/course.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { PaginationService } from 'src/services/pagination.service';

@Controller('courses')
export class CoursesController {
    
    constructor(private readonly coursesService: CoursesService,
    private readonly paginationService: PaginationService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
        return this.coursesService.create(createCourseDto);
    }

    @Get()
    async findAll(): Promise<CourseResponseDto[]> {
        return this.coursesService.findAll();
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
    async enroll(@Param('id') courseId: string, @Req() req): Promise<{ message: string }> {
        await this.coursesService.enrollUser(req.user.id, courseId);
        return { message: 'Successfully enrolled in course' };
    }

     @Get()
  async getCourses(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.paginationService.findAll({
      page: Number(page),
      limit: Number(limit),
    });
  }

}
