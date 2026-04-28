import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class UserProfileResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'id field' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Jane Doe', description: 'username field' })
  @Expose()
  username: string | null;

  @ApiProperty({ example: 'user@example.com', description: 'email field' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'example', description: 'role field' })
  @Expose()
  role: UserRole;

  @ApiProperty({ example: 'example', description: 'walletAddress field' })
  @Expose()
  walletAddress: string | null;

  @ApiProperty({ example: 1, description: 'xp field' })
  @Expose()
  xp: number;

  @ApiProperty({ example: 1, description: 'streak field' })
  @Expose()
  streak: number;

  @ApiProperty({ example: 'example', description: 'bio field' })
  @Expose()
  bio: string | null;

  @ApiProperty({ example: 'https://example.com/resource', description: 'avatarUrl field' })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'createdAt field' })
  @Expose()
  createdAt: Date;
}

