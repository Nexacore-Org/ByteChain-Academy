import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';

/** GET /courses/:id/enrollment-status */
export class EnrollmentStatusResponseDto {
  @IsBoolean()
  enrolled: boolean;

  @IsOptional()
  @IsDate()
  enrolledAt?: Date;
}

/** POST /courses/:id/enroll — returned registration */
export class CourseRegistrationResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsDate()
  enrolledAt: Date;
}

/** GET /courses/enrolled — one row per enrolment */
export class EnrolledCourseResponseDto {
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

  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent: number;

  @IsDate()
  enrolledAt: Date;
}
