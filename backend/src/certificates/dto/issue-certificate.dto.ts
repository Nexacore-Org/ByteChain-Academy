import { IsString, IsEmail, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueCertificateDto {
  @ApiProperty({ example: 'example', description: 'recipientName field' })
  @IsString()
  recipientName: string;

  @ApiProperty({ example: 'example', description: 'recipientEmail field' })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({ example: 'example', description: 'courseOrProgram field' })
  @IsString()
  courseOrProgram: string;

  @ApiProperty({ example: true, description: 'issuedAt field' })
  @IsDate()
  issuedAt: Date;

  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'expiresAt field',
    required: false,
  })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @ApiProperty({
    example: 'example',
    description: 'certificateData field',
    required: false,
  })
  @IsOptional()
  certificateData?: any;
}
