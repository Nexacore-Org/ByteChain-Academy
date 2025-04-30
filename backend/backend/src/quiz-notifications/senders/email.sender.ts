import { Injectable, Logger } from "@nestjs/common"
import type { Notification } from "../entities/notification.entity"

@Injectable()
export class EmailSender {
  private readonly logger = new Logger(EmailSender.name)

  async send(notification: Notification): Promise<void> {
    // In a real implementation, you would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll just log the email that would be sent

    this.logger.log(`Sending email notification to ${notification.recipient.email}`)
    this.logger.log(`Subject: ${notification.title}`)
    this.logger.log(`Content: ${notification.content}`)

    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 100))

    this.logger.log(`Email sent to ${notification.recipient.email}`)
  }
}
