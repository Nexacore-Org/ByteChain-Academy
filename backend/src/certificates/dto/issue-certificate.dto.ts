import { IsString, IsEmail, IsOptional, IsDate } from 'class-validator';

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
