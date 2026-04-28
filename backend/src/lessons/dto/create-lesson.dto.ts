import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'example', description: 'content field' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'videoUrl field', required: false })
  @IsUrl({}, { message: 'videoUrl must be a valid URL' })
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ example: true, description: 'published field', required: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ example: 0, description: 'videoStartTimestamp field', required: false })
  @IsNumber()
  @Min(0, { message: 'videoStartTimestamp must be a non-negative number' })
  @IsOptional()
  videoStartTimestamp?: number;

  @ApiProperty({ example: 1, description: 'order field', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'courseId field', required: false })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}

