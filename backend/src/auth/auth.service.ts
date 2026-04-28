import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { UserService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { UserRole } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    const accessToken = this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);
    const username = user.username || user.name || user.email.split('@')[0];

    await this.emailService.sendWelcomeEmail(user.email, username);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is temporarily locked. Please try again in ${minutesRemaining} minute(s).`,
      );
    }

    const isPasswordValid = await this.userService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      await this.userService.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.suspended) {
      throw new ForbiddenException('Your account has been suspended');
    }

    await this.userService.resetFailedLoginAttempts(user.id);

    const accessToken = this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const resetToken = await this.userService.createResetToken(
      forgotPasswordDto.email,
    );
    const clientBaseUrl =
      this.configService.get<string>('CLIENT_URL') ?? 'http://localhost:3000';
    const resetUrl = `${clientBaseUrl}/reset-password?email=${encodeURIComponent(forgotPasswordDto.email)}&token=${encodeURIComponent(resetToken)}`;

    await this.emailService.sendPasswordResetEmail(
      forgotPasswordDto.email,
      resetToken,
      resetUrl,
    );

    return {
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    await this.userService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    return {
      message: 'Password reset successfully',
    };
  }

  private generateToken(user: { id: string; email: string; role: UserRole }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const hashedToken = this.hashToken(rawToken);
    
    const expiresInDays = parseInt(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '30',
      10,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.refreshTokenRepository.save({
      hashedToken,
      userId,
      expiresAt,
      revoked: false,
    });

    return rawToken;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const hashedToken = this.hashToken(refreshTokenDto.refreshToken);

    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { hashedToken },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Revoke the old token
    tokenRecord.revoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    // Generate new tokens
    const accessToken = this.generateToken(tokenRecord.user);
    const newRefreshToken = await this.generateRefreshToken(tokenRecord.userId);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(logoutDto: LogoutDto) {
    const hashedToken = this.hashToken(logoutDto.refreshToken);

    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { hashedToken },
    });

    if (tokenRecord && !tokenRecord.revoked) {
      tokenRecord.revoked = true;
      await this.refreshTokenRepository.save(tokenRecord);
    }

    return {
      message: 'Logged out successfully',
    };
  }
}
