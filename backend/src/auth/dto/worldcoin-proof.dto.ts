import { IsString, IsNotEmpty } from 'class-validator';

export class WorldcoinProofDto {
  @IsString()
  @IsNotEmpty()
  signal: string;

  @IsString()
  @IsNotEmpty()
  proof: string;

  @IsString()
  @IsNotEmpty()
  merkle_root: string;

  @IsString()
  @IsNotEmpty()
  nullifier_hash: string;

  @IsString()
  @IsNotEmpty()
  action: string;
}
