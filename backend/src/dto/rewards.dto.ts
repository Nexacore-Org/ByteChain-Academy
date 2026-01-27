import { IsInt, IsOptional, Max, Min } from 'class-validator';

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
}
