import { IsInt, IsOptional, Max, Min, IsString, IsEnum } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  lessonsCompletedDelta?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  coursesCompletedDelta?: number;

  @IsOptional()
  @IsString()
  activityId?: string;

  @IsOptional()
  @IsEnum(['lesson', 'course'])
  activityType?: 'lesson' | 'course';
}
