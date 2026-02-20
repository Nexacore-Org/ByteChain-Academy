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

export class CertificateResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsString()
  @IsNotEmpty()
  courseOrProgram: string;

  @IsDate()
  @Type(() => Date)
  issuedAt: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt: Date | null;

  @IsBoolean()
  isValid: boolean;

  @IsOptional()
  certificateData: any;
}

export class CertificateVerificationResultDto {
  @IsBoolean()
  isValid: boolean;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CertificateResponseDto)
  certificate?: CertificateResponseDto;
}
