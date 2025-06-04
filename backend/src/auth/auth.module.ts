import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { Admin } from '../admin/entities/admin.entity';
import { EmailService } from './services/email.service';
import { WorldcoinService } from './services/worldcoin.service';
import { WorldcoinVerificationMiddleware } from './middleware/worldcoin-verification.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RefreshToken,
      EmailVerification,
      PasswordReset,
      Admin,
    ]),
  ],
  providers: [AuthService, EmailService],
  controllers: [AuthController],
  exports: [AuthService, WorldcoinService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WorldcoinVerificationMiddleware)
      .forRoutes('auth/register/student', 'auth/register/tutor');
  }
}
