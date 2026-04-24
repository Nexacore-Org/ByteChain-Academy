import { IsInt, IsOptional, Max, Min, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ example: 1, description: 'lessonsCompletedDelta field', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  lessonsCompletedDelta?: number;

  @ApiProperty({ example: 1, description: 'coursesCompletedDelta field', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  coursesCompletedDelta?: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'activityId field', required: false })
  @IsOptional()
  @IsString()
  activityId?: string;

  @ApiProperty({ example: 'example', description: 'activityType field', required: false })
  @IsOptional()
  @IsEnum(['lesson', 'course'])
  activityType?: 'lesson' | 'course';
}

