import { Injectable, Logger } from "@nestjs/common"
import type { Notification } from "../entities/notification.entity"

@Injectable()
export class InAppSender {
  private readonly logger = new Logger(InAppSender.name)

  async send(notification: Notification): Promise<void> {
    // In a real implementation, you might use WebSockets to deliver in-app notifications in real-time
    // For now, we'll just log that the notification is ready to be fetched by the client

    this.logger.log(`In-app notification ready for user ${notification.recipient.id}`)
    this.logger.log(`Title: ${notification.title}`)
    this.logger.log(`Content: ${notification.content}`)

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 50))

    this.logger.log(`In-app notification processed for user ${notification.recipient.id}`)
  }
}
