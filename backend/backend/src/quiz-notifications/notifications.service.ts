import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Notification, NotificationStatus, NotificationType } from "./entities/notification.entity"
import type { CreateNotificationDto } from "./dto/create-notification.dto"
import type { UpdateNotificationDto } from "./dto/update-notification.dto"
import type { NotificationSenders } from "./senders/notification-senders"
import type { UsersService } from "../users/users.service"

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private notificationSenders: NotificationSenders,
    private usersService: UsersService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { recipientId, ...notificationData } = createNotificationDto

    // Find the recipient user
    const recipient = await this.usersService.findOne(recipientId)
    if (!recipient) {
      throw new NotFoundException(`User with ID ${recipientId} not found`)
    }

    // Create the notification
    const notification = this.notificationsRepository.create({
      ...notificationData,
      recipient,
    })

    // Save the notification
    const savedNotification = await this.notificationsRepository.save(notification)

    // Send the notification
    try {
      await this.notificationSenders.send(savedNotification)

      // Update status to sent
      savedNotification.status = NotificationStatus.SENT
      return this.notificationsRepository.save(savedNotification)
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack)

      // Update status to failed
      savedNotification.status = NotificationStatus.FAILED
      return this.notificationsRepository.save(savedNotification)
    }
  }

  async createQuizCompletionNotification(
    userId: string,
    quizId: string,
    quizTitle: string,
    score: number,
    totalQuestions: number,
  ): Promise<Notification> {
    const title = "Quiz Completed"
    const content = `You have completed the quiz "${quizTitle}" with a score of ${score}/${totalQuestions}.`

    return this.create({
      title,
      content,
      type: NotificationType.QUIZ_COMPLETED,
      recipientId: userId,
      referenceId: quizId,
      metadata: {
        score,
        totalQuestions,
        quizTitle,
      },
    })
  }

  async createDaoVoteNotification(userId: string, proposalId: string, proposalTitle: string): Promise<Notification> {
    const title = "New DAO Vote"
    const content = `A new proposal "${proposalTitle}" is available for voting.`

    return this.create({
      title,
      content,
      type: NotificationType.DAO_VOTE,
      recipientId: userId,
      referenceId: proposalId,
      metadata: {
        proposalTitle,
      },
    })
  }

  async findAll(userId?: string): Promise<Notification[]> {
    const queryBuilder = this.notificationsRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.recipient", "recipient")

    if (userId) {
      queryBuilder.where("recipient.id = :userId", { userId })
    }

    return queryBuilder.orderBy("notification.createdAt", "DESC").getMany()
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ["recipient"],
    })

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    return notification
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id)

    // If recipientId is provided, update the recipient
    if (updateNotificationDto.recipientId) {
      const recipient = await this.usersService.findOne(updateNotificationDto.recipientId)
      if (!recipient) {
        throw new NotFoundException(`User with ID ${updateNotificationDto.recipientId} not found`)
      }
      notification.recipient = recipient
      delete updateNotificationDto.recipientId
    }

    // Update other fields
    Object.assign(notification, updateNotificationDto)

    return this.notificationsRepository.save(notification)
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id)

    notification.status = NotificationStatus.READ
    notification.readAt = new Date()

    return this.notificationsRepository.save(notification)
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id)
    await this.notificationsRepository.remove(notification)
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: {
        recipient: { id: userId },
        status: NotificationStatus.SENT,
        readAt: null,
      },
    })
  }
}
