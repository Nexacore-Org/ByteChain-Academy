import { IsString, IsNumber, Min, Max, IsUUID, MinLength } from 'class-validator';

export class CreateCourseReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10)
  comment: string;

  @IsUUID()
  courseId: string;
} 