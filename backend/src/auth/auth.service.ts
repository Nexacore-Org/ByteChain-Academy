import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { Admin } from '../admin/entities/admin.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../roles/roles.enum';
import * as dotenv from 'dotenv';
import { EmailService } from './services/email.service';
import { randomBytes } from 'crypto';
dotenv.config();


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string, role: string): Promise<Admin | null> {
    if (!email || !password || !role) {
      throw new UnauthorizedException('Email, password, and role are required');
    }
    const validRoles = [UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR];
    if (!validRoles.includes(role as UserRole)) {
      throw new UnauthorizedException(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
    }
    const user = await this.adminRepo.findOne({ where: { email, role: role as UserRole } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async generateTokens(user: Admin) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '1h' },
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' },
    );
    const expiresAt = new Date(Date.now() + this.parseExpiration(process.env.REFRESH_TOKEN_EXPIRATION || '7d'));
    const tokenEntity = this.refreshTokenRepo.create({
      token: refreshToken,
      expiresAt,
      revoked: false,
      user,
    });
    await this.refreshTokenRepo.save(tokenEntity);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokenEntity = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken, revoked: false },
      relations: ['user'],
    });
    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    tokenEntity.revoked = true;
    await this.refreshTokenRepo.save(tokenEntity);
    return this.generateTokens(tokenEntity.user);
  }

  async logout(refreshToken: string) {
    const tokenEntity = await this.refreshTokenRepo.findOne({ where: { token: refreshToken } });
    if (tokenEntity) {
      tokenEntity.revoked = true;
      await this.refreshTokenRepo.save(tokenEntity);
    }
  }

  private parseExpiration(exp: string): number {
    const match = /^(\d+)([smhd])$/.exec(exp);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    switch (match[2]) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  async requestEmailVerification(email: string): Promise<void> {
    const user = await this.adminRepo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Invalidate any existing verification tokens
    await this.emailVerificationRepo.update(
      { email, verified: false },
      { verified: true }
    );

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const verification = this.emailVerificationRepo.create({
      token,
      email,
      expiresAt,
      user,
    });

    await this.emailVerificationRepo.save(verification);
    await this.emailService.sendVerificationEmail(email, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const verification = await this.emailVerificationRepo.findOne({
      where: { token, verified: false },
      relations: ['user'],
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    verification.verified = true;
    await this.emailVerificationRepo.save(verification);

    if (verification.user) {
      verification.user.emailVerified = true;
      await this.adminRepo.save(verification.user);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.adminRepo.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that the user doesn't exist
      return;
    }

    // Invalidate any existing reset tokens
    await this.passwordResetRepo.update(
      { email, used: false },
      { used: true }
    );

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const reset = this.passwordResetRepo.create({
      token,
      email,
      expiresAt,
      user,
    });

    await this.passwordResetRepo.save(reset);
    await this.emailService.sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await this.passwordResetRepo.findOne({
      where: { token, used: false },
      relations: ['user'],
    });

    if (!reset) {
      throw new BadRequestException('Invalid reset token');
    }

    if (reset.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    if (!reset.user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    reset.user.password = hashedPassword;
    reset.used = true;

    await this.adminRepo.save(reset.user);
    await this.passwordResetRepo.save(reset);
  }
}