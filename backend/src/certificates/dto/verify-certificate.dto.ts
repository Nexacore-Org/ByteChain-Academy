import { IsString } from 'class-validator';

export class VerifyCertificateDto {
  @IsString()
  certificateHash: string;
}
