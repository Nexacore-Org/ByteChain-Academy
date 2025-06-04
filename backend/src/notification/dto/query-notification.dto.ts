import { IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from '../enums/notification.enums';

export class QueryNotificationDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(String(value)))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(String(value)))
  limit?: number = 20;
}
