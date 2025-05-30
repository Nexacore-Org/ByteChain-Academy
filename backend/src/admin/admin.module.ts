import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { PasswordHashingService } from 'src/tutor/services/password.hashing.service';
import { BcryptHashingService } from 'src/tutor/services/bcrypt.hashing.service';
// import { PasswordHashingService } from '../common/services/password-hashing.service';
// import { BcryptHashingService } from '../common/services/bcrypt-hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  controllers: [AdminDashboardController],
  providers: [
    AdminDashboardService,
    {
      provide: PasswordHashingService,
      useClass: BcryptHashingService,
    },
  ],
  exports: [AdminDashboardService],
})
export class AdminModule {}
