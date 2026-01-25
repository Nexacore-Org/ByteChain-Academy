import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

@Exclude()
export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
