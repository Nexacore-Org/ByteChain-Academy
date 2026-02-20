import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RewardsService } from '../rewards/rewards.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  async getEarnedBadges(@Req() req: RequestWithUser) {
    return this.rewardsService.getEarnedBadges(req.user.id);
  }

  @Get('milestones')
  async getBadgeMilestones() {
    return this.rewardsService.getBadgeMilestones();
  }

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProgressDto,
  ) {
    const lessons = dto.lessonsCompletedDelta ?? 0;
    const courses = dto.coursesCompletedDelta ?? 0;

    if (lessons <= 0 && courses <= 0 && !dto.activityId) {
      throw new BadRequestException(
        'Provide lessonsCompletedDelta, coursesCompletedDelta > 0, or an activityId',
      );
    }

    return this.rewardsService.updateProgressAndAwardBadges({
      userId: req.user.id,
      lessonsCompletedDelta: lessons,
      coursesCompletedDelta: courses,
      activityId: dto.activityId,
      activityType: dto.activityType,
    });
  }
}
