import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RewardsService } from '../rewards/rewards.service';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Returns XP, badges, and recent reward history for the authenticated user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async getMyRewards(@Req() req: RequestWithUser) {
    return this.rewardsService.getMyRewards(req.user.id);
  }

  @Get('leaderboard')
  @ApiOkResponse({ description: 'Returns top 10 users with rank, username, xp, and badgesCount' })
  async getLeaderboard() {
    return this.rewardsService.getLeaderboard();
  }

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getEarnedBadges(@Req() req: RequestWithUser) {
    return this.rewardsService.getEarnedBadges(req.user.id);
  }

  @Get('milestones')
  async getBadgeMilestones() {
    return this.rewardsService.getBadgeMilestones();
  }
}
