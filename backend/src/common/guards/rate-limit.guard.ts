import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    if (req.user?.id) {
      return Promise.resolve(`user-${req.user.id}`);
    }
    return Promise.resolve(req.ip);
  }
}
