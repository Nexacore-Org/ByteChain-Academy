import { ApiProperty } from "@nestjs/swagger"
import {
  type Notification,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "../entities/notification.entity"

export class NotificationResponseDto {
  @ApiProperty({ description: "Unique identifier for the notification" })
  id: string

  @ApiProperty({ description: "Title of the notification" })
  title: string

  @ApiProperty({ description: "Content of the notification" })
  content: string

  @ApiProperty({ enum: NotificationType, description: "Type of notification" })
  type: NotificationType

  @ApiProperty({ enum: NotificationChannel, description: "Channel through which notification is sent" })
  channel: NotificationChannel

  @ApiProperty({ enum: NotificationStatus, description: "Current status of the notification" })
  status: NotificationStatus

  @ApiProperty({ description: "Reference ID to the related entity (quiz ID, DAO vote ID, etc.)" })
  referenceId: string

  @ApiProperty({ description: "Additional metadata for the notification" })
  metadata: Record<string, any>

  @ApiProperty({ description: "User ID who received the notification" })
  recipientId: string

  @ApiProperty({ description: "When the notification was created" })
  createdAt: Date

  @ApiProperty({ description: "When the notification was last updated" })
  updatedAt: Date

  @ApiProperty({ description: "When the notification was read by the user", nullable: true })
  readAt: Date

  constructor(notification: Notification) {
    this.id = notification.id
    this.title = notification.title
    this.content = notification.content
    this.type = notification.type
    this.channel = notification.channel
    this.status = notification.status
    this.referenceId = notification.referenceId
    this.metadata = notification.metadata
    this.recipientId = notification.recipient?.id
    this.createdAt = notification.createdAt
    this.updatedAt = notification.updatedAt
    this.readAt = notification.readAt
  }
}
