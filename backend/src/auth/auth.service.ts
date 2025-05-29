import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import * as jwt from 'jsonwebtoken';
import { Student } from '../student/entities/student.entity';
import { Tutor } from '../tutor/entities/tutor.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async generateTokens(user: Student | Tutor, userType: 'student' | 'tutor') {
    const payload = { sub: user.id, type: userType };
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
      student: userType === 'student' ? (user as Student) : undefined,
      tutor: userType === 'tutor' ? (user as Tutor) : undefined,
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
      relations: ['student', 'tutor'],
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    tokenEntity.revoked = true;
    await this.refreshTokenRepo.save(tokenEntity);

    const user = tokenEntity.student || tokenEntity.tutor;
    const userType = tokenEntity.student ? 'student' : 'tutor';

    return this.generateTokens(user, userType);
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
}