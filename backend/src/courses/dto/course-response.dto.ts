import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({
    example: 'A concise description of the resource.',
    description: 'description field',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
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
    this.enrollmentCount = options?.enrollmentCount ?? course.registrations?.length ?? 0;
    this.createdAt = course.createdAt;
    this.updatedAt = course.updatedAt;
    if (options?.isEnrolled !== undefined) {
      this.isEnrolled = options.isEnrolled;
    }
  }
}
