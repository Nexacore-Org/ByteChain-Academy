import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
} from 'class-validator';
import { NotificationType, UserRole } from '../enums/notification.enums';

export class SendNotificationDto {
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
}

export class BulkSendNotificationDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  recipientIds: string[];

  @IsEnum(UserRole)
  recipientRole: UserRole;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
