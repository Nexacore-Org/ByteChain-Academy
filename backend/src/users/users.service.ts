import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Like } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from './entities/user.entity';
import { Certificate } from '../certificates/entities/certificate.entity';
import { UserBadge } from '../rewards/entities/user-badge.entity';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { PaginatedResult } from '../common/services/pagination.service';

type AvatarUploadFile = {
  size: number;
  mimetype: string;
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(CourseRegistration)
    private courseRegistrationRepository: Repository<CourseRegistration>,
  ) { }

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

  private resolveXp(user: User): number {
    if ((user.xp ?? 0) > 0) return user.xp;
    return user.points ?? 0;
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

    if (updateProfileDto.username !== undefined) {
      user.username = updateProfileDto.username;
      // Keep legacy `name` in sync for existing flows that still read it.
      user.name = updateProfileDto.username;
    }
    if (updateProfileDto.bio !== undefined) user.bio = updateProfileDto.bio;

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

  async getMyProfile(userId: string): Promise<{
    id: string;
    username: string | null;
    email: string;
    role: UserRole;
    walletAddress: string | null;
    xp: number;
    streak: number;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  }> {
    const user = await this.getProfile(userId);
    return {
      id: user.id,
      username: user.username ?? user.name ?? null,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress ?? null,
      xp: this.resolveXp(user),
      streak: user.streak ?? 0,
      bio: user.bio ?? null,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
    };
  }

  async uploadAvatar(
    userId: string,
    file: AvatarUploadFile | undefined,
  ): Promise<{ avatarUrl: string }> {
    if (!file) throw new BadRequestException('Avatar image is required');
    const user = await this.getProfile(userId);

    const maxAvatarSizeMb = Number(process.env.MAX_AVATAR_SIZE_MB || 2);
    const maxBytes = maxAvatarSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `Avatar file size must be <= ${maxAvatarSizeMb}MB`,
      );
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const uploadPath = process.env.AVATAR_UPLOAD_PATH || 'uploads/avatars';
    await fs.mkdir(uploadPath, { recursive: true });

    const safeExt = extname(file.originalname) || '.png';
    const fileName = `${crypto.randomUUID()}${safeExt}`;
    const absolutePath = join(uploadPath, fileName);
    await fs.writeFile(absolutePath, file.buffer);

    user.avatarUrl = `/${uploadPath.replace(/\\/g, '/')}/${fileName}`;
    await this.userRepository.save(user);

    return { avatarUrl: user.avatarUrl };
  }

  async deleteProfile(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const deletionId = crypto.randomUUID();

    user.email = `deleted-${deletionId}@bytechain.invalid`;
    user.name = 'Deleted User';

    user.username = null;
    user.walletAddress = null;
    user.avatarUrl = null;
    user.bio = null;
    user.resetToken = null;

    // prevent login completely
    user.password = crypto.randomUUID();

    await this.userRepository.save(user);
  }

  async getMyStats(userId: string): Promise<{
    courseCount: number;
    completedCourseCount: number;
    certificateCount: number;
    xp: number;
    streak: number;
    longestStreak: number;
    lastActiveAt: Date | null;
    badgesCount: number;
    rank: number;
  }> {
    const user = await this.getProfile(userId);

    const resolvedXp = this.resolveXp(user);
    const [courseCount, certificateCount, badgesCount, usersAhead] =
      await Promise.all([
        this.courseRegistrationRepository.count({ where: { userId } }),
        this.certificateRepository.count({ where: { user: { id: userId } } }),
        this.userBadgeRepository.count({ where: { userId } }),
        this.userRepository.count({
          where: { points: MoreThan(resolvedXp) },
        }),
      ]);

    return {
      courseCount,
      completedCourseCount: user.coursesCompleted ?? 0,
      certificateCount,
      xp: resolvedXp,
      streak: user.streak ?? 0,
      longestStreak: user.longestStreak ?? 0,
      lastActiveAt: user.lastActiveAt ?? null,
      badgesCount,
      rank: usersAhead + 1,
    };
  }

  async getPublicProfile(userId: string): Promise<{
    id: string;
    username: string | null;
    xp: number;
    badgesCount: number;
    coursesCompleted: number;
    avatarUrl: string | null;
    bio: string | null;
  }> {
    const user = await this.getProfile(userId);
    const badgesCount = await this.userBadgeRepository.count({
      where: { userId },
    });

    return {
      id: user.id,
      username: user.username ?? user.name ?? null,
      xp: this.resolveXp(user),
      badgesCount,
      coursesCompleted: user.coursesCompleted ?? 0,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
    };
  }

  async adminListUsers(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResult<User>> {
    const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, limit))
      : 10;
    const trimmedSearch = search?.trim();

    const where = trimmedSearch
      ? [
        { email: Like(`%${trimmedSearch}%`) },
        { username: Like(`%${trimmedSearch}%`) },
        { name: Like(`%${trimmedSearch}%`) },
      ]
      : undefined;

    const [data, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async adminGetUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async adminUpdateRole(
    actorUserId: string,
    userId: string,
    role: UserRole,
  ): Promise<User> {
    const user = await this.adminGetUser(userId);

    if (actorUserId === userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admins cannot demote themselves');
    }

    user.role = role;
    return this.userRepository.save(user);
  }

  async adminSuspendUser(userId: string, suspended: boolean): Promise<User> {
    const user = await this.adminGetUser(userId);
    user.suspended = suspended;
    return this.userRepository.save(user);
  }
}
