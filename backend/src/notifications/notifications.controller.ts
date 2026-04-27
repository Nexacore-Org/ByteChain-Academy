import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Request() req): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.getMyNotifications(
      req.user.id as string,
    );
    return plainToInstance(NotificationResponseDto, notifications);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req): Promise<{ unreadCount: number }> {
    return this.notificationsService.getUnreadCount(req.user.id as string);
  }

  @Patch(':id/read')
  async markAsRead(
    @Request() req,
    @Param('id') notificationId: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.markAsRead(
      req.user.id as string,
      notificationId,
    );
    return plainToInstance(NotificationResponseDto, notification);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req): Promise<{ updatedCount: number }> {
    return this.notificationsService.markAllAsRead(req.user.id as string);
  }
}
