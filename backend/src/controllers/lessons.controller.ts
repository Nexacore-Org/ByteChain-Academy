import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { LessonsService } from '../services/lessons.service';
import { CreateLessonDto, UpdateLessonDto, LessonResponseDto } from '../dto/lesson.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { PaginationService } from 'src/services/pagination.service';

@Controller('lessons')
export class LessonsController {
    
    constructor(private readonly lessonsService: LessonsService,
    private readonly paginationService: PaginationService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() createLessonDto: CreateLessonDto): Promise<LessonResponseDto> {
        const lesson = await this.lessonsService.create(createLessonDto);
        return new LessonResponseDto(lesson);
    }

    @Get('course/:courseId')
    async findByCourse(@Param('courseId') courseId: string): Promise<LessonResponseDto[]> {
        const lessons = await this.lessonsService.findAllByCourse(courseId);
        return lessons.map(lesson => new LessonResponseDto(lesson));
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

 @Get()
  async getLessons(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  return this.paginationService.findAllLessons({
    page: Number(page),
    limit: Number(limit),
  });
}

}
