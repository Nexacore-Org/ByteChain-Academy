import { ApiProperty, PartialType } from "@nestjs/swagger"
import { CreateNotificationDto } from "./create-notification.dto"
import { IsDate, IsEnum, IsOptional } from "class-validator"
import { NotificationStatus } from "../entities/notification.entity"

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({ enum: NotificationStatus, description: "Current status of the notification" })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus

  @ApiProperty({ description: "When the notification was read by the user" })
  @IsDate()
  @IsOptional()
  readAt?: Date
}
