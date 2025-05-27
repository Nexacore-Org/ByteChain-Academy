import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { CourseLevel } from '../enums/courseLevel.enum';

export class CreateCourseDto {
  @ApiProperty({
    description: 'The title of the course',
    example: 'Introduction to NestJS',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'The description of the course',
    example: 'Learn the basics of NestJS framework',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The difficulty level of the course',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
    example: 'intermediate',
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiPropertyOptional({
    description: 'The price of the course',
    example: 29.99,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Whether the course is published',
    default: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'The duration of the course in hours',
    example: 12.5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'The URL of the course thumbnail',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;
}
