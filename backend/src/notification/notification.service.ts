import { Injectable, NotFoundException } from '@nestjs/common';
import { type Repository, type FindOptionsWhere, Between } from 'typeorm';
import type { Notification } from './entities/notification.entity';
import type { CreateNotificationDto } from './dto/create-notification.dto';
import type {
  SendNotificationDto,
  BulkSendNotificationDto,
} from './dto/send-notification.dto';
import type { QueryNotificationDto } from './dto/query-notification.dto';
import type { UserRole } from './enums/notification.enums';

@Injectable()
export class NotificationService {
  private notificationRepository: Repository<Notification>;

  constructor(notificationRepository: Repository<Notification>) {
    this.notificationRepository = notificationRepository;
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return await this.notificationRepository.save(notification);
  }

  async sendNotification(
    sendNotificationDto: SendNotificationDto,
    senderId?: string,
    senderRole?: UserRole,
  ): Promise<Notification> {
    const notificationData: CreateNotificationDto = {
      ...sendNotificationDto,
      senderId,
      senderRole,
    };

    const notification = await this.create(notificationData);

    // Here you can add real-time notification logic (WebSocket, SSE, etc.)
    // await this.sendRealTimeNotification(notification);

    return notification;
  }

  async sendBulkNotifications(
    bulkSendDto: BulkSendNotificationDto,
    senderId?: string,
    senderRole?: UserRole,
  ): Promise<Notification[]> {
    const notifications = bulkSendDto.recipientIds.map((recipientId) =>
      this.notificationRepository.create({
        recipientId,
        recipientRole: bulkSendDto.recipientRole,
        type: bulkSendDto.type,
        message: bulkSendDto.message,
        metadata: bulkSendDto.metadata,
        senderId,
        senderRole,
      }),
    );

    const savedNotifications =
      await this.notificationRepository.save(notifications);

    // Send real-time notifications for each recipient
    // for (const notification of savedNotifications) {
    //   await this.sendRealTimeNotification(notification);
    // }

    return savedNotifications;
  }

  async findUserNotifications(
    userId: string,
    userRole: UserRole,
    queryDto: QueryNotificationDto,
  ) {
    const { type, isRead, fromDate, toDate, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<Notification> = {
      recipientId: userId,
      recipientRole: userRole,
    };

    if (type) {
      where.type = type;
    }

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (fromDate || toDate) {
      where.createdAt = Between(
        fromDate ? new Date(fromDate) : new Date('1970-01-01'),
        toDate ? new Date(toDate) : new Date(),
      );
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        recipientId: userId,
        recipientRole: userRole,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string, userRole: UserRole): Promise<void> {
    await this.notificationRepository.update(
      {
        recipientId: userId,
        recipientRole: userRole,
        isRead: false,
      },
      { isRead: true },
    );
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        recipientId: userId,
        recipientRole: userRole,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  async getUnreadCount(userId: string, userRole: UserRole): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        recipientId: userId,
        recipientRole: userRole,
        isRead: false,
      },
    });
  }

  // Admin-only methods
  async findAllNotifications(queryDto: QueryNotificationDto) {
    const { type, isRead, fromDate, toDate, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<Notification> = {};

    if (type) {
      where.type = type;
    }

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (fromDate || toDate) {
      where.createdAt = Between(
        fromDate ? new Date(fromDate) : new Date('1970-01-01'),
        toDate ? new Date(toDate) : new Date(),
      );
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteNotificationAsAdmin(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  // Helper method for triggering notifications from other services
  async triggerNotification(
    recipientId: string,
    recipientRole: UserRole,
    type: string,
    message: string,
    metadata?: Record<string, any>,
    senderId?: string,
    senderRole?: UserRole,
  ): Promise<Notification> {
    return await this.sendNotification(
      {
        recipientId,
        recipientRole,
        type: type as unknown as Notification['type'],
        message,
        metadata,
      },
      senderId,
      senderRole,
    );
  }

  // Future: Real-time notification method
  // private async sendRealTimeNotification(notification: Notification): Promise<void> {
  //   // Implement WebSocket or Server-Sent Events logic here
  //   // Example: this.websocketGateway.sendToUser(notification.recipientId, notification);
  // }
}
