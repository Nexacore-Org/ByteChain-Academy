import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDate,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'A concise description of the resource.',
    description: 'description field',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: true, description: 'published field' })
  @IsBoolean()
  published: boolean;

  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'createdAt field',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'updatedAt field',
  })
  @IsDate()
  updatedAt: Date;

  /** Present on GET /courses when the request includes a valid JWT */
  @ApiProperty({
    example: true,
    description: 'isEnrolled field',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnrolled?: boolean;

  constructor(
    course: {
      id: string;
      title: string;
      description: string;
      published: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
    options?: { isEnrolled?: boolean },
  ) {
    this.id = course.id;
    this.title = course.title;
    this.description = course.description;
    this.published = course.published;
    this.createdAt = course.createdAt;
    this.updatedAt = course.updatedAt;
    if (options?.isEnrolled !== undefined) {
      this.isEnrolled = options.isEnrolled;
    }
  }
}
