import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WorldcoinService } from '../services/worldcoin.service';

interface WorldcoinProofBody {
  signal: string;
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  action: string;
}

@Injectable()
export class WorldcoinVerificationMiddleware implements NestMiddleware {
  constructor(private readonly worldcoinService: WorldcoinService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { signal, proof, merkle_root, nullifier_hash, action } =
      req.body as WorldcoinProofBody;

    if (!signal || !proof || !merkle_root || !nullifier_hash || !action) {
      throw new BadRequestException('Missing Worldcoin proof data');
    }

    const isValid = await this.worldcoinService.verifyProof({
      signal,
      proof,
      merkle_root,
      nullifier_hash,
      action,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid Worldcoin proof');
    }

    next();
  }
}
