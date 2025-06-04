import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import type { NotificationService } from './notification.service';
import type {
  SendNotificationDto,
  BulkSendNotificationDto,
} from './dto/send-notification.dto';
import type { QueryNotificationDto } from './dto/query-notification.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { UserRole } from './enums/notification.enums';

interface RequestUser {
  id: string;
  role: UserRole;
}

interface RequestWithUser extends Request {
  user: RequestUser;
}

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async sendNotification(
    @Request() req: RequestWithUser,
    @Body() sendNotificationDto: SendNotificationDto,
  ) {
    return await this.notificationService.sendNotification(
      sendNotificationDto,
      req.user.id,
      req.user.role,
    );
  }

  @Post('bulk')
  async sendBulkNotifications(
    @Request() req: RequestWithUser,
    @Body() bulkSendDto: BulkSendNotificationDto,
  ) {
    return await this.notificationService.sendBulkNotifications(
      bulkSendDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get()
  async getUserNotifications(
    @Request() req: RequestWithUser,
    @Query() queryDto: QueryNotificationDto,
  ) {
    return await this.notificationService.findUserNotifications(
      req.user.id,
      req.user.role,
      queryDto,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: RequestWithUser) {
    const count = await this.notificationService.getUnreadCount(
      req.user.id,
      req.user.role,
    );
    return { unreadCount: count };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ) {
    return await this.notificationService.markAsRead(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: RequestWithUser) {
    await this.notificationService.markAllAsRead(req.user.id, req.user.role);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
  ) {
    await this.notificationService.deleteNotification(
      id,
      req.user.id,
      req.user.role,
    );
    return { message: 'Notification deleted successfully' };
  }

  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteNotificationAsAdmin(@Param('id', ParseUUIDPipe) id: string) {
    await this.notificationService.deleteNotificationAsAdmin(id);
    return { message: 'Notification deleted successfully' };
  }
}
