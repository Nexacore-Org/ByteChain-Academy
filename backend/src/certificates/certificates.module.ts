import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from '../certificates/entities/certificate.entity';
import { Course } from '../courses/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, User, Course]),
    NotificationsModule,
    EmailModule,
  ],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificatesModule {}
