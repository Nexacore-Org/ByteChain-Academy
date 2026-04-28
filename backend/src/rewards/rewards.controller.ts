import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RewardsService } from '../rewards/rewards.service';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  /**
   * Returns XP, badges, and recent reward history for the authenticated user.
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get my rewards' })
  @ApiResponse({ status: 200, description: 'Rewards retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiOperation({
    summary: 'Get my rewards',
    description:
      'Returns XP total, earned badges, and recent reward history for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'The rewards summary for the authenticated user.',
    schema: {
      type: 'object',
      properties: {
        xp: { type: 'number', example: 250 },
        badges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              badge: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  key: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  xpThreshold: { type: 'number' },
                  iconUrl: { type: 'string', nullable: true },
                },
              },
              awardedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        recentHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              amount: { type: 'number', example: 10 },
              reason: {
                type: 'string',
                enum: [
                  'LESSON_COMPLETE',
                  'QUIZ_PASS',
                  'COURSE_COMPLETE',
                  'STREAK_MILESTONE',
                ],
              },
              label: { type: 'string', example: 'Completed a lesson' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  async getMyRewards(@Req() req: RequestWithUser) {
    return this.rewardsService.getMyRewards(req.user.id);
  }

  /**
   * Returns the top 10 users on the leaderboard (public — no auth required).
   */
  @Get('leaderboard')
  @ApiOperation({
    summary: 'Get leaderboard',
    description:
      'Returns the top 10 users ranked by XP, including their badge count. Public endpoint — no authentication required.',
  })
  @ApiOkResponse({
    description: 'Top 10 leaderboard entries.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number', example: 1 },
          username: { type: 'string', example: 'alice', nullable: true },
          xp: { type: 'number', example: 500 },
          badgesCount: { type: 'number', example: 3 },
        },
      },
    },
  })
  async getLeaderboard() {
    return this.rewardsService.getLeaderboard();
  }

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get earned badges',
    description: 'Returns all badges earned by the authenticated user.',
  })
  @ApiOkResponse({ description: 'List of earned badges with award dates.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  async getEarnedBadges(@Req() req: RequestWithUser) {
    return this.rewardsService.getEarnedBadges(req.user.id);
  }

  @Get('milestones')
  @ApiOperation({
    summary: 'Get badge milestones',
    description:
      'Returns all available badge milestones. Public endpoint — no authentication required.',
  })
  @ApiOkResponse({ description: 'List of badge milestones.' })
  async getBadgeMilestones() {
    return this.rewardsService.getBadgeMilestones();
  }
}
