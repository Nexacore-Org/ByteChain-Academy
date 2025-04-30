import { Injectable } from "@nestjs/common"
import { type Notification, NotificationChannel } from "../entities/notification.entity"
import type { EmailSender } from "./email.sender"
import type { PushSender } from "./push.sender"
import type { InAppSender } from "./in-app.sender"

@Injectable()
export class NotificationSenders {
  constructor(
    private emailSender: EmailSender,
    private pushSender: PushSender,
    private inAppSender: InAppSender,
  ) {}

  async send(notification: Notification): Promise<void> {
    switch (notification.channel) {
      case NotificationChannel.EMAIL:
        await this.emailSender.send(notification)
        break
      case NotificationChannel.PUSH:
        await this.pushSender.send(notification)
        break
      case NotificationChannel.IN_APP:
        await this.inAppSender.send(notification)
        break
      default:
        // Default to in-app notification
        await this.inAppSender.send(notification)
    }
  }
}
