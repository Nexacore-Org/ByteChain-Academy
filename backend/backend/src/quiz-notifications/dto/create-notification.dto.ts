import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"
import { NotificationChannel, NotificationType } from "../entities/notification.entity"

export class CreateNotificationDto {
  @ApiProperty({ description: "Title of the notification" })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ description: "Content of the notification" })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiProperty({ enum: NotificationType, description: "Type of notification" })
  @IsEnum(NotificationType)
  type: NotificationType

  @ApiProperty({ enum: NotificationChannel, description: "Channel through which notification is sent" })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel

  @ApiProperty({ description: "Reference ID to the related entity (quiz ID, DAO vote ID, etc.)" })
  @IsString()
  @IsOptional()
  referenceId?: string

  @ApiProperty({ description: "Additional metadata for the notification" })
  @IsOptional()
  metadata?: Record<string, any>

  @ApiProperty({ description: "User ID who will receive the notification" })
  @IsUUID()
  @IsNotEmpty()
  recipientId: string
}
