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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Notifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/NotificationResponseDto' }
        },
        total: { type: 'number', example: 42 },
        unreadCount: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyNotifications(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: NotificationResponseDto[]; total: number; unreadCount: number }> {
    const result = await this.notificationsService.getMyNotifications(
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
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ 
    status: 200, 
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const result = await this.notificationsService.getUnreadCount(req.user.id as string);
    return { count: result.unreadCount };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 204, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@Request() req): Promise<void> {
    await this.notificationsService.markAllAsRead(req.user.id as string);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', type: String, description: 'Notification ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification marked as read successfully',
    type: NotificationResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify another user\'s notification' })
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
}
