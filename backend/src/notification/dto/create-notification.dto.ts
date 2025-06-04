import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';
import { NotificationType } from '../enums/notification.enums';
import { UserRole } from 'src/roles/roles.enum';

export class CreateNotificationDto {
  @IsUUID()
  recipientId: string;

  @IsEnum(UserRole)
  recipientRole: UserRole;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  senderId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  senderRole?: UserRole;
}
