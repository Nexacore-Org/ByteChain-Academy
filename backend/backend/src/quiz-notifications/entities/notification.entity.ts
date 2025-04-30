import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { User } from "../../users/entities/user.entity" // Assuming you have a User entity

export enum NotificationType {
  QUIZ_COMPLETED = "quiz_completed",
  DAO_VOTE = "dao_vote",
}

export enum NotificationChannel {
  EMAIL = "email",
  PUSH = "push",
  IN_APP = "in_app",
}

export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  READ = "read",
}

@Entity("notifications")
export class Notification {
  @ApiProperty({ description: "Unique identifier for the notification" })
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "Title of the notification" })
  @Column()
  title: string

  @ApiProperty({ description: "Content of the notification" })
  @Column()
  content: string

  @ApiProperty({ enum: NotificationType, description: "Type of notification" })
  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType

  @ApiProperty({ enum: NotificationChannel, description: "Channel through which notification is sent" })
  @Column({
    type: "enum",
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel

  @ApiProperty({ enum: NotificationStatus, description: "Current status of the notification" })
  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus

  @ApiProperty({ description: "Reference ID to the related entity (quiz ID, DAO vote ID, etc.)" })
  @Column({ nullable: true })
  referenceId: string

  @ApiProperty({ description: "Additional metadata for the notification" })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @ApiProperty({ description: "User who will receive the notification" })
  @ManyToOne(() => User, { eager: true })
  recipient: User

  @ApiProperty({ description: "When the notification was created" })
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ description: "When the notification was last updated" })
  @UpdateDateColumn()
  updatedAt: Date

  @ApiProperty({ description: "When the notification was read by the user", nullable: true })
  @Column({ nullable: true })
  readAt: Date
}
