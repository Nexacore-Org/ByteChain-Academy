import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RewardsService } from '../rewards/rewards.service';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyRewards(@Req() req: RequestWithUser) {
    return this.rewardsService.getMyRewards(req.user.id);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.rewardsService.getLeaderboard();
  }

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  async getEarnedBadges(@Req() req: RequestWithUser) {
    return this.rewardsService.getEarnedBadges(req.user.id);
  }

  @Get('milestones')
  async getBadgeMilestones() {
    return this.rewardsService.getBadgeMilestones();
  }
}
