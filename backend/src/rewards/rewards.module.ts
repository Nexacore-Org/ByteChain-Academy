import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Badge } from './entities/badge.entity';
import { RewardHistory } from './entities/reward-history.entity';
import { UserBadge } from './entities/user-badge.entity';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Badge, UserBadge, RewardHistory]),
    NotificationsModule,
    WebhooksModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
