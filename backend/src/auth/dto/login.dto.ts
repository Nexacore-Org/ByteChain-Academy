import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'email field' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123', description: 'password field' })
  @IsString()
  password: string;
}

