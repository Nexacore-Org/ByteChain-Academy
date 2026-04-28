import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** GET /courses/:id/enrollment-status */
export class EnrollmentStatusResponseDto {
  @ApiProperty({ example: true, description: 'enrolled field' })
  @IsBoolean()
  enrolled: boolean;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'enrolledAt field', required: false })
  @IsOptional()
  @IsDate()
  enrolledAt?: Date;
}

/** POST /courses/:id/enroll — returned registration */
export class CourseRegistrationResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'id field' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'userId field' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'courseId field' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'enrolledAt field' })
  @IsDate()
  enrolledAt: Date;
}

/** GET /courses/enrolled — one row per enrolment */
export class EnrolledCourseResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'id field' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A concise description of the resource.', description: 'description field' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: true, description: 'published field' })
  @IsBoolean()
  published: boolean;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'createdAt field' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'updatedAt field' })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ example: 1, description: 'progressPercent field' })
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent: number;

  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'enrolledAt field' })
  @IsDate()
  enrolledAt: Date;
}

