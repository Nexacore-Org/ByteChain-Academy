import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Jane Doe',
    description: 'username field',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  username?: string;

  @ApiProperty({
    example: 'example',
    description: 'bio field',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    example: true,
    description: 'onboardingCompleted field',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;

  @ApiProperty({
    example: 'Learn DeFi',
    description: 'learningGoal field',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  learningGoal?: string;
}
