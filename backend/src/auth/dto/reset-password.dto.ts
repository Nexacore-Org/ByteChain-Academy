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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)',
  })
  newPassword: string;
}

