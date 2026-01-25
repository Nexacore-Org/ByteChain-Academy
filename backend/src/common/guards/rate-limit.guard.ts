import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Authenticated users → user-based rate limiting
    if (req.user?.id) {
      return `user-${req.user.id}`;
    }

    // Public users → IP-based rate limiting
    return req.ip;
  }
}
