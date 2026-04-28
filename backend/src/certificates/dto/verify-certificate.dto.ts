import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCertificateDto {
  @ApiProperty({ example: 'example', description: 'certificateHash field' })
  @IsString()
  certificateHash: string;
}

