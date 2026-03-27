import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ThrottlerLimitDetail } from '@nestjs/throttler';
import { RateLimitGuard } from './rate-limit.guard';

@Injectable()
export class AuthThrottlerGuard extends RateLimitGuard {
  private readonly logger = new Logger(AuthThrottlerGuard.name);

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<{
      ip?: string;
      method?: string;
      originalUrl?: string;
      url?: string;
    }>();

    const route = `${request.method ?? 'UNKNOWN'} ${request.originalUrl ?? request.url ?? 'UNKNOWN'}`;
    const ip = request.ip ?? 'unknown-ip';
    const retryAfter = Math.max(
      1,
      Math.ceil((throttlerLimitDetail.timeToExpire ?? 0) / 1000),
    );

    this.logger.warn(`429 Too Many Requests from ${ip} on ${route}`);

    throw new HttpException(
      {
        statusCode: 429,
        message: 'Too many requests',
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
