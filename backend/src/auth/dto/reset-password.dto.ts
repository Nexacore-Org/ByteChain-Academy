import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'email field' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'example', description: 'token field' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'P@ssw0rd123', description: 'newPassword field' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

