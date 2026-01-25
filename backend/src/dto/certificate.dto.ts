import { IsString, IsEmail, IsOptional, IsDate, IsBoolean } from 'class-validator';

export class VerifyCertificateDto {
  @IsString()
  certificateHash: string;
}

export class CertificateResponseDto {
  id: string;
  recipientName: string;
  recipientEmail: string;
  courseOrProgram: string;
  issuedAt: Date;
  expiresAt: Date | null;
  isValid: boolean;
  certificateData: any;
}

export class CertificateVerificationResultDto {
  isValid: boolean;
  message: string;
  certificate?: CertificateResponseDto;
}

export class IssueCertificateDto {
  @IsString()
  recipientName: string;

  @IsEmail()
  recipientEmail: string;

  @IsString()
  courseOrProgram: string;

  @IsDate()
  issuedAt: Date;

  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @IsOptional()
  certificateData?: any;
}
