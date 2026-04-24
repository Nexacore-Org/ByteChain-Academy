import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RewardsService } from '../rewards/rewards.service';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my rewards' })
  @ApiResponse({ status: 200, description: 'Rewards retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyRewards(@Req() req: RequestWithUser) {
    return this.rewardsService.getMyRewards(req.user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get rewards leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard() {
    return this.rewardsService.getLeaderboard();
  }

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get earned badges' })
  @ApiResponse({ status: 200, description: 'Badges retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEarnedBadges(@Req() req: RequestWithUser) {
    return this.rewardsService.getEarnedBadges(req.user.id);
  }

  @Get('milestones')
  @ApiOperation({ summary: 'Get badge milestones' })
  @ApiResponse({ status: 200, description: 'Milestones retrieved successfully' })
  async getBadgeMilestones() {
    return this.rewardsService.getBadgeMilestones();
  }
}
