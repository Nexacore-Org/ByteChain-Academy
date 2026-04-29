import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    link?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      message,
      link: link ?? null,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }

  async getMyNotifications(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const currentPage = page && page > 0 ? page : 1;
    const currentLimit = limit && limit > 0 ? limit : 10;
    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: currentLimit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { data, total, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { unreadCount };
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('You cannot modify this notification');
    }
    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const unreadNotifications = await this.notificationRepository.find({
      where: { userId, isRead: false },
      select: ['id'],
    });

    if (unreadNotifications.length === 0) {
      return { updatedCount: 0 };
    }

    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();

    return { updatedCount: unreadNotifications.length };
  }
}
