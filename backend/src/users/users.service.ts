import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/auth/dto/ register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async createResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.generateResetToken();
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    await this.userRepository.update(user.id, {
      resetToken: hashedToken,
      resetTokenExpires: expiresAt,
    });

    return resetToken;
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        email,
        resetTokenExpires: MoreThan(new Date()),
      },
    });

    if (
      !user ||
      !user.resetToken ||
      !(await bcrypt.compare(token, user.resetToken))
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpires: undefined,
    });
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.getProfile(userId);

    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }

    return this.userRepository.save(user);
  }

  async deleteProfile(userId: string): Promise<void> {
    const user = await this.getProfile(userId);
    await this.userRepository.remove(user);
  }

  async getStats(
    userId: string,
    courseCount: number,
    certificateCount: number,
  ): Promise<{ courseCount: number; certificateCount: number; xp: number }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'points'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      courseCount,
      certificateCount,
      xp: user.points ?? 0,
    };
  }
}
