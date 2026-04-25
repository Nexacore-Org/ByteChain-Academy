// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UserService } from './users.service';
import { WalletService } from './wallet.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CertificatesModule } from '../certificates/certificates.module';
import { CoursesModule } from '../courses/courses.module';
import { Certificate } from '../certificates/entities/certificate.entity';
import { UserBadge } from '../rewards/entities/user-badge.entity';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { StreakService } from './streak.service';
import { RewardsModule } from '../rewards/rewards.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Certificate,
      UserBadge,
      CourseRegistration,
    ]),
    CacheModule.register({
      ttl: 300,
      max: 500,
    }),
    CertificatesModule,
    NotificationsModule,
    forwardRef(() => CoursesModule),
    forwardRef(() => RewardsModule),
  ],
  controllers: [UsersController],
  providers: [UserService, StreakService, WalletService],
  exports: [UserService, StreakService, WalletService],
})
export class UsersModule {}