import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RequestEmailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
