import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class AdminUserListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  username: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  suspended: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class AdminUserDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  username: string | null;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  bio: string | null;

  @ApiProperty({ nullable: true })
  walletAddress: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  suspended: boolean;

  @ApiProperty()
  points: number;

  @ApiProperty()
  xp: number;

  @ApiProperty()
  streak: number;

  @ApiProperty()
  longestStreak: number;

  @ApiProperty({ nullable: true })
  lastActiveAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminUsersListResponseDto {
  @ApiProperty({ type: () => [AdminUserListItemDto] })
  data: AdminUserListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
