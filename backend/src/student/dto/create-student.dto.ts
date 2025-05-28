import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MaxLength(50)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @Matches(/^\d{10,15}$/, {
    message: 'Phone number must be between 10-15 digits',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
