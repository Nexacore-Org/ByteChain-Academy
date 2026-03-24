import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

@Exclude()
export class UserProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string | null;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  walletAddress: string | null;

  @Expose()
  xp: number;

  @Expose()
  streak: number;

  @Expose()
  bio: string | null;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  createdAt: Date;
}
