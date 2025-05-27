import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

} 