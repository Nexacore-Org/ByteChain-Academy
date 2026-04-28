import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsDate,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CertificateResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'example', description: 'recipientName field' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: 'example', description: 'recipientEmail field' })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @ApiProperty({ example: 'example', description: 'courseOrProgram field' })
  @IsString()
  @IsNotEmpty()
  courseOrProgram: string;

  @ApiProperty({ example: true, description: 'issuedAt field' })
  @IsDate()
  @Type(() => Date)
  issuedAt: Date;

  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'expiresAt field',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt: Date | null;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'isValid field',
  })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({
    example: 'example',
    description: 'certificateData field',
    required: false,
  })
  @IsOptional()
  certificateData: any;
}

export class CertificateVerificationResultDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'isValid field',
  })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({ example: 'example', description: 'message field' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'example',
    description: 'certificate field',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CertificateResponseDto)
  certificate?: CertificateResponseDto;
}
