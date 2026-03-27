import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDate,
  IsOptional,
} from 'class-validator';

export class CourseResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  published: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  /** Present on GET /courses when the request includes a valid JWT */
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
