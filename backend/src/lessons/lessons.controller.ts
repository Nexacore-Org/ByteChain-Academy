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
} from '@nestjs/common';
import { LessonsService } from './lessons.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
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

  @Get('course/:courseId')
  async findByCourse(
    @Param('courseId') courseId: string,
  ): Promise<LessonResponseDto[]> {
    const lessons = await this.lessonsService.findAllByCourse(courseId);
    return lessons.map((lesson) => new LessonResponseDto(lesson));
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
