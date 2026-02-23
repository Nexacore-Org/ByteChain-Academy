import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { CompleteLessonDto } from './dto/complete-lesson.dto';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * Mark a lesson as complete for the authenticated user.
   * Triggers certificate auto-issuance when all lessons in the course are completed.
   */
  @Post('lesson')
  @UseGuards(JwtAuthGuard)
  async completeLesson(
    @Req() req: RequestWithUser,
    @Body() dto: CompleteLessonDto,
  ) {
    return this.progressService.completeLesson(
      req.user.id,
      dto.courseId,
      dto.lessonId,
    );
  }

  /**
   * Get the authenticated user's progress for a specific course (list of lesson completion statuses).
   */
  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async getCourseProgress(
    @Req() req: RequestWithUser,
    @Param('courseId') courseId: string,
  ) {
    if (!courseId) {
      throw new BadRequestException('courseId is required');
    }
    return this.progressService.getCourseProgress(req.user.id, courseId);
  }
}
