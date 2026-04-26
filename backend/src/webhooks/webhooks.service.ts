import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  async registerWebhook(userId: string, dto: CreateWebhookDto): Promise<Webhook> {
    const secret = crypto.randomBytes(32).toString('hex');
    const webhook = this.webhookRepository.create({
      ...dto,
      userId,
      secret,
    });
    return this.webhookRepository.save(webhook);
  }

  async listWebhooks(userId: string): Promise<Webhook[]> {
    return this.webhookRepository.find({ 
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async deleteWebhook(userId: string, id: string): Promise<void> {
    await this.webhookRepository.delete({ id, userId });
  }

  /**
   * Dispatches an event to all active webhooks subscribed to it.
   * This runs asynchronously and does not block the caller.
   */
  async dispatchEvent(event: string, payload: any): Promise<void> {
    // Find active webhooks that are subscribed to this specific event
    const activeWebhooks = await this.webhookRepository.find({
      where: { active: true },
    });

    const subscribedWebhooks = activeWebhooks.filter((w) =>
      w.events.includes(event),
    );

    if (subscribedWebhooks.length === 0) return;

    this.logger.debug(`Dispatching event ${event} to ${subscribedWebhooks.length} webhooks`);

    for (const webhook of subscribedWebhooks) {
      // Execute delivery without awaiting to avoid blocking the main application flow
      this.sendWebhook(webhook, event, payload).catch((err) => {
        const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        this.logger.error(`Webhook delivery failed for ${webhook.url} (Event: ${event}): ${errorMessage}`);
      });
    }
  }

  private async sendWebhook(webhook: Webhook, event: string, payload: any): Promise<void> {
    const timestamp = Date.now();
    const data = JSON.stringify({ 
      event, 
      payload, 
      timestamp,
      webhookId: webhook.id 
    });

    // HMAC-SHA256 signature for verification
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(data)
      .digest('hex');

    await axios.post(webhook.url, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-ByteChain-Signature': signature,
        'X-ByteChain-Event': event,
        'X-ByteChain-Timestamp': timestamp.toString(),
      },
      timeout: 10000, // 10s timeout
    });
  }
}
