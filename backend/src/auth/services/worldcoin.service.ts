import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { WorldcoinProofDto } from '../dto/worldcoin-proof.dto';

interface WorldcoinVerifyResponse {
  success: boolean;
  [key: string]: unknown;
}

@Injectable()
export class WorldcoinService {
  private readonly VERIFY_ENDPOINT =
    'https://developer.worldcoin.org/api/v1/verify';

  async verifyProof(proofDto: WorldcoinProofDto): Promise<boolean> {
    try {
      const response: AxiosResponse<WorldcoinVerifyResponse> = await axios.post(
        this.VERIFY_ENDPOINT,
        {
          signal: proofDto.signal,
          proof: proofDto.proof,
          merkle_root: proofDto.merkle_root,
          nullifier_hash: proofDto.nullifier_hash,
          action: proofDto.action,
        },
      );

      if (response.data && typeof response.data.success === 'boolean') {
        return response.data.success;
      } else {
        throw new HttpException(
          'Invalid response from Worldcoin verification',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch {
      throw new HttpException(
        'Worldcoin verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
