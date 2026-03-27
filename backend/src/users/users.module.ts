// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CertificatesModule } from '../certificates/certificates.module';
import { CoursesModule } from '../courses/courses.module';
import { Certificate } from '../certificates/entities/certificate.entity';
import { UserBadge } from '../rewards/entities/user-badge.entity';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { StreakService } from './streak.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Certificate,
      UserBadge,
      CourseRegistration,
    ]),
    CertificatesModule,
    CoursesModule,
  ],
  controllers: [UsersController],
  providers: [UserService, StreakService],
  exports: [UserService, StreakService],
})
export class UsersModule {}
