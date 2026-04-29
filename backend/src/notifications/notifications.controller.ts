import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully', type: [NotificationResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyNotifications(@Request() req): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.getMyNotifications(
      req.user.id as string,
      page,
      limit,
    );
    return {
      data: plainToInstance(NotificationResponseDto, result.data),
      total: result.total,
      unreadCount: result.unreadCount,
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@Request() req): Promise<{ unreadCount: number }> {
    return this.notificationsService.getUnreadCount(req.user.id as string);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
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
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@Request() req): Promise<{ updatedCount: number }> {
    return this.notificationsService.markAllAsRead(req.user.id as string);
  }
}
