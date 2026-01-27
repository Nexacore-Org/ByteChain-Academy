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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateProgressDto } from '../dto/rewards.dto';
import { RewardsService } from '../services/rewards.service';

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

    if (lessons <= 0 && courses <= 0) {
      throw new BadRequestException(
        'Provide lessonsCompletedDelta and/or coursesCompletedDelta > 0',
      );
    }

    return this.rewardsService.updateProgressAndAwardBadges({
      userId: req.user.id,
      lessonsCompletedDelta: lessons,
      coursesCompletedDelta: courses,
    });
  }
}
