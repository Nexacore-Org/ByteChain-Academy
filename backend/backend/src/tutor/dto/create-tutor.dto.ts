import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';

export class CreateTutorDto {
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  courses: string[];

  @IsNumber()
  @Min(0)
  experience: number;

  @IsOptional()
  @Matches(/^\d{10,15}$/, {
    message: 'Phone number must be between 10-15 digits',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
