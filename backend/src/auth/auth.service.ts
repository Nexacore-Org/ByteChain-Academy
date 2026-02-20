/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/ register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.userService.create(registerDto);
      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
    try {
      const resetToken = await this.userService.createResetToken(
        forgotPasswordDto.email,
      );

      // In a real application, you would send an email here
      // For now, we'll just return the token (in production, never do this)
      return {
        message: 'Password reset link sent to your email',
        resetToken, // Only for development/testing
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      await this.userService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
