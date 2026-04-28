import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyWalletDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^G[A-Z2-7]{55}$/, {
    message:
      'walletAddress must be a valid Stellar public key (56-character G-address)',
  })
  @ApiProperty({ example: 'example', description: 'walletAddress field' })
  walletAddress: string;

  @ApiProperty({ example: 'example', description: 'signature field' })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
