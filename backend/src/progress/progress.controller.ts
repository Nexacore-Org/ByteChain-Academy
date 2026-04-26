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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { CompleteLessonDto } from './dto/complete-lesson.dto';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * Mark a lesson as complete for the authenticated user.
   * Triggers certificate auto-issuance when all lessons in the course are completed.
   */
  @Post('complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a lesson as complete' })
  @ApiResponse({
    status: 201,
    description: 'Lesson marked as complete successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @Get(':courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get course progress for a user' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of lesson completion states',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lessonId: { type: 'string' },
          completed: { type: 'boolean' },
          completedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
