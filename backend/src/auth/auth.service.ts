import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Admin } from '../admin/entities/admin.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../roles/roles.enum';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<Admin | null> {
    if (!email || !password || !role) {
      throw new UnauthorizedException('Email, password, and role are required');
    }
    const validRoles = [UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR];
    if (!validRoles.includes(role as UserRole)) {
      throw new UnauthorizedException(
        `Invalid role. Valid roles are: ${validRoles.join(', ')}`,
      );
    }
    const user = await this.adminRepo.findOne({
      where: { email, role: role as UserRole },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async generateTokens(user: Admin) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '1h',
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    });
    const expiresAt = new Date(
      Date.now() +
        this.parseExpiration(process.env.REFRESH_TOKEN_EXPIRATION || '7d'),
    );
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
    const tokenEntity = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
    });
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
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
