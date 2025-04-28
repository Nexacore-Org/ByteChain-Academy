import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { ProgressTrackingService } from './progress.service';
import { CreateProgressDto } from './dto/progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressTrackingService) {}

  @Post()
  async createProgress(@Body() createProgressDto: CreateProgressDto) {
    return await this.progressService.createProgress(createProgressDto);
  }

  @Patch(':id')
  async updateProgress(
    @Param('id') id: number,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return await this.progressService.updateProgress(id, updateProgressDto);
  }

  @Get('student/:studentId/course/:courseId')
  async getStudentProgress(
    @Param('studentId') studentId: number,
    @Param('courseId') courseId: number,
  ) {
    return await this.progressService.getStudentProgress(studentId, courseId);
  }

  @Get('student/:studentId/course/:courseId/completion')
  async getCourseCompletion(
    @Param('studentId') studentId: number,
    @Param('courseId') courseId: number,
  ) {
    return await this.progressService.calculateCourseCompletion(
      studentId,
      courseId,
    );
  }
}
