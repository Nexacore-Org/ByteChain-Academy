import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { User } from './entities/user.entity';

const CHALLENGE_TTL_SECONDS = 300;

const CHALLENGE_KEY = (userId: string) => `wallet-challenge-${userId}`;

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ── Challenge generation ──────────────────────────────────────────────────

  async generateChallenge(userId: string): Promise<{ challenge: string }> {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const challenge = `ByteChain-link-${userId}-${timestamp}-${nonce}`;

    await this.cacheManager.set(
      CHALLENGE_KEY(userId),
      challenge,
      CHALLENGE_TTL_SECONDS * 1000, // cache-manager v5 expects milliseconds
    );

    return { challenge };
  }

  // ── Signature verification and wallet linking ─────────────────────────────
  async verifyAndLink(
    userId: string,
    walletAddress: string,
    signature: string,
  ): Promise<{ walletAddress: string }> {
    // Step 1 — Retrieve the challenge
    const challenge = await this.cacheManager.get<string>(
      CHALLENGE_KEY(userId),
    );

    if (!challenge) {
      throw new BadRequestException(
        'No pending challenge found. Challenges expire after 5 minutes. ' +
          'Please request a new challenge via POST /wallet/challenge.',
      );
    }

    // Step 2 — Verify the ED25519 signature
    let valid = false;
    try {
      const keypair = Keypair.fromPublicKey(walletAddress);
      valid = keypair.verify(
        Buffer.from(challenge),
        Buffer.from(signature, 'base64'),
      );
    } catch {
      // fromPublicKey throws if the address is malformed
      throw new BadRequestException(
        'Invalid wallet address or signature format.',
      );
    }

    if (!valid) {
      throw new BadRequestException(
        'Signature verification failed. ' +
          'Ensure you signed the exact challenge string with the private key ' +
          'corresponding to the provided wallet address.',
      );
    }

    // Step 3 — Consume the challenge (prevents reuse within the TTL window)
    await this.cacheManager.del(CHALLENGE_KEY(userId));

    // Step 4 — Persist the wallet address
    try {
      await this.userRepository.update(userId, { walletAddress });
    } catch (err: any) {
      // PostgreSQL unique violation code 23505 / SQLite SQLITE_CONSTRAINT
      if (
        err?.code === '23505' ||
        err?.message?.includes('UNIQUE constraint failed') ||
        err?.message?.includes('unique constraint')
      ) {
        throw new ConflictException(
          `Wallet address ${walletAddress} is already linked to another ByteChain account.`,
        );
      }
      throw err;
    }

    return { walletAddress };
  }

  // ── Unlink ────────────────────────────────────────────────────────────────

  async unlink(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.walletAddress) {
      throw new BadRequestException(
        'No wallet address is currently linked to this account.',
      );
    }

    // Clear any pending challenge for this user as a cleanup step
    await this.cacheManager.del(CHALLENGE_KEY(userId));

    await this.userRepository.update(userId, { walletAddress: null });
  }

  async getStatus(
    userId: string,
  ): Promise<{ linked: boolean; walletAddress?: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['walletAddress'],
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.walletAddress) {
      return { linked: true, walletAddress: user.walletAddress };
    }

    return { linked: false };
  }
}
