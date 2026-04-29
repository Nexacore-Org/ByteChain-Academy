import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { Webhook } from './entities/webhook.entity';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('webhooks')
@ApiBearerAuth('access-token')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new outbound webhook' })
  @ApiResponse({
    status: 201,
    description: 'Webhook registered successfully',
    type: Webhook,
  })
  async registerWebhook(
    @Req() req: RequestWithUser,
    @Body() dto: CreateWebhookDto,
  ) {
    return this.webhooksService.registerWebhook(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all webhooks for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of webhooks',
    type: [Webhook],
  })
  async listWebhooks(@Req() req: RequestWithUser) {
    return this.webhooksService.listWebhooks(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 204, description: 'Webhook deleted successfully' })
  async deleteWebhook(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.webhooksService.deleteWebhook(req.user.id, id);
  }
}
