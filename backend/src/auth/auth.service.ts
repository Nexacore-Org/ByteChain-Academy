import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    const token = this.generateToken(user);
    const username = user.username || user.name || user.email.split('@')[0];

    await this.emailService.sendWelcomeEmail(user.email, username);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
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

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
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
}
