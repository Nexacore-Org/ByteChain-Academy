import { IsUrl, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookEvent {
  CERTIFICATE_ISSUED = 'certificate.issued',
  COURSE_COMPLETED = 'course.completed',
  DAO_PROPOSAL_PASSED = 'dao.proposal.passed',
  BADGE_EARNED = 'badge.earned',
}

export class CreateWebhookDto {
  @ApiProperty({
    example: 'https://myservice.com/webhooks',
    description: 'The URL to send the webhook payload to',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: ['certificate.issued', 'course.completed'],
    description: 'Array of event types to subscribe to',
    enum: WebhookEvent,
    isArray: true,
  })
  @IsArray()
  @IsEnum(WebhookEvent, { each: true })
  @IsNotEmpty()
  events: WebhookEvent[];
}
