import { Exclude, Expose } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';

@Exclude()
export class NotificationResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: NotificationType;

  @Expose()
  message: string;

  @Expose()
  link: string | null;

  @Expose()
  isRead: boolean;

  @Expose()
  createdAt: Date;
}
