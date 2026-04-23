import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress } from './entities/progress.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { CertificatesModule } from '../certificates/certificates.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progress, Lesson]),
    CertificatesModule,
    NotificationsModule,
    RewardsModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
