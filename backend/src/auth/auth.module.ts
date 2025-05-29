import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StudentModule } from '../student/student.module';
import { TutorModule } from '../tutor/tutor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    StudentModule,
    TutorModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}