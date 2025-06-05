import { Controller, Get, Put, Body, UseGuards, Request, Post, Delete, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { UserRole } from "src/roles/roles.enum"
import { RolesGuard } from "src/roles/roles.guard"
import { NotificationPreferenceService } from "../providers/notification-preference.service"
import { UpdateNotificationPreferenceDto } from "../dto/update-notification-preference.dto"

interface RequestUser {
  id: string
  role: UserRole
}

interface RequestWithUser extends Request {
  user: RequestUser
}

@ApiTags("notification-preferences")
@Controller("notification-preferences")
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class NotificationPreferenceController {
  constructor(private readonly notificationPreferenceService: NotificationPreferenceService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'User notification preferences retrieved successfully',
  })
  async getPreferences(@Request() req: any) {
    return await this.notificationPreferenceService.findByUser(
      req.user.id,
      req.user.role,
    );
  }

  @Put()
  @ApiOperation({ summary: "Update current user notification preferences" })
  @ApiResponse({
    status: 200,
    description: "Notification preferences updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async updatePreferences(@Request() req: any, @Body() updateDto: UpdateNotificationPreferenceDto) {
    return await this.notificationPreferenceService.update(req.user.id, req.user.role, updateDto)
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset notification preferences to defaults' })
  @ApiResponse({
    status: 200,
    description: 'Notification preferences reset to defaults',
  })
  async resetPreferences(@Request() req: any) {
    return await this.notificationPreferenceService.resetToDefaults(
      req.user.id,
      req.user.role,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user notification preferences' })
  @ApiResponse({
    status: 204,
    description: 'Notification preferences deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Preferences not found' })
  async deletePreferences(@Request() req: any) {
    await this.notificationPreferenceService.remove(
      req.user.id,
      req.user.role,
    );
  }
}
