import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    
    // Attach to request object for pino-http to pick up
    (req as any).correlationId = correlationId;
    
    // Include in response headers
    res.set('X-Correlation-ID', correlationId);
    
    next();
  }
}
