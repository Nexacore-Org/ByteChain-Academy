import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RolesGuard } from '../roles/roles.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
  };
  course?: {
    id: number;
  };
}

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(RolesGuard)
  @Get('next-courses')
  async getNextCourses(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    return this.recommendationService.getNextCourses(userId);
  }
}
