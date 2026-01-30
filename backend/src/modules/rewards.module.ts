import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsController } from '../controllers/rewards.controller';
import { RewardsService } from '../services/rewards.service';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { User } from '../entities/user.entity';
import { RewardHistory } from '../entities/reward-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Badge, UserBadge, RewardHistory])],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
