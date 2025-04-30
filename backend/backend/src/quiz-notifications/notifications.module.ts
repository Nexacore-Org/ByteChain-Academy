import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NotificationsService } from "./notifications.service"
import { NotificationsController } from "./notifications.controller"
import { Notification } from "./entities/notification.entity"
import { NotificationSenders } from "./senders/notification-senders"
import { EmailSender } from "./senders/email.sender"
import { PushSender } from "./senders/push.sender"
import { InAppSender } from "./senders/in-app.sender"
import { UsersModule } from "../users/users.module" // Assuming you have a Users module

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationSenders, EmailSender, PushSender, InAppSender],
  exports: [NotificationsService],
})
export class NotificationsModule {}
