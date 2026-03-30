import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerifyWalletDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^G[A-Z2-7]{55}$/, {
    message:
      'walletAddress must be a valid Stellar public key (56-character G-address)',
  })
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}