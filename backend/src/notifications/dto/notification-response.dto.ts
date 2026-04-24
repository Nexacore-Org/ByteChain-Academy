import { Exclude, Expose } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class NotificationResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'id field' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'example', description: 'type field' })
  @Expose()
  type: NotificationType;

  @ApiProperty({ example: 'example', description: 'message field' })
  @Expose()
  message: string;

  @ApiProperty({ example: 'example', description: 'link field' })
  @Expose()
  link: string | null;

  @ApiProperty({ example: true, description: 'isRead field' })
  @Expose()
  isRead: boolean;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'createdAt field' })
  @Expose()
  createdAt: Date;
}

