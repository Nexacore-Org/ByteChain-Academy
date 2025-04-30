import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger"
import type { NotificationsService } from "./notifications.service"
import type { CreateNotificationDto } from "./dto/create-notification.dto"
import type { UpdateNotificationDto } from "./dto/update-notification.dto"
import { NotificationResponseDto } from "./dto/notification-response.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard" // Assuming you have an auth guard
import { User } from "../decorators/user.decorator" // Assuming you have a user decorator

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'The notification has been successfully created.', type: NotificationResponseDto })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.create(createNotificationDto);
    return new NotificationResponseDto(notification);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter notifications by user ID' })
  @ApiResponse({ status: 200, description: 'Return all notifications.', type: [NotificationResponseDto] })
  async findAll(@Query('userId') userId?: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.findAll(userId);
    return notifications.map(notification => new NotificationResponseDto(notification));
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'Return current user notifications.', type: [NotificationResponseDto] })
  async findMyNotifications(@User('id') userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.findAll(userId);
    return notifications.map(notification => new NotificationResponseDto(notification));
  }

  @Get('count/unread')
  @ApiOperation({ summary: 'Count unread notifications for current user' })
  @ApiResponse({ status: 200, description: 'Return count of unread notifications.' })
  async countUnread(@User('id') userId: string): Promise<{ count: number }> {
    const count = await this.notificationsService.countUnread(userId);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Return the notification.', type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async findOne(@Param('id') id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.findOne(id);
    return new NotificationResponseDto(notification);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a notification" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({
    status: 200,
    description: "The notification has been successfully updated.",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Notification not found." })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.update(id, updateNotificationDto)
    return new NotificationResponseDto(notification)
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'The notification has been marked as read.', type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async markAsRead(@Param('id') id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.markAsRead(id);
    return new NotificationResponseDto(notification);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'The notification has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
