import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ProfileResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'id field' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'email field' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'Jane Doe', description: 'name field' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'example', description: 'role field' })
  @Expose()
  role: UserRole;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'createdAt field' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'updatedAt field' })
  @Expose()
  updatedAt: Date;
}

