import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CourseResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
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

  @ApiProperty()
  @IsBoolean()
  published: boolean;

  @ApiProperty({ example: 'Beginner', required: false, nullable: true })
  @IsOptional()
  @IsString()
  difficulty: string | null;

  @ApiProperty({ example: ['bitcoin', 'defi'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    example: 'https://example.com/thumb.jpg',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl: string | null;

  @ApiProperty({ example: 42, description: 'Number of enrolled users' })
  @IsInt()
  enrollmentCount: number;

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
      difficulty?: string | null;
      tags?: string[];
      thumbnailUrl?: string | null;
      registrations?: { id: string }[];
      createdAt: Date;
      updatedAt: Date;
    },
    options?: { isEnrolled?: boolean; enrollmentCount?: number },
  ) {
    this.id = course.id;
    this.title = course.title;
    this.description = course.description;
    this.published = course.published;
    this.difficulty = course.difficulty ?? null;
    this.tags = course.tags ?? [];
    this.thumbnailUrl = course.thumbnailUrl ?? null;
    this.enrollmentCount =
      options?.enrollmentCount ?? course.registrations?.length ?? 0;
    this.createdAt = course.createdAt;
    this.updatedAt = course.updatedAt;
    if (options?.isEnrolled !== undefined) {
      this.isEnrolled = options.isEnrolled;
    }
  }
}
