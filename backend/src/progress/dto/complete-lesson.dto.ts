import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'lessonId field' })
  @IsString()
  @IsUUID()
  lessonId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'courseId field' })
  @IsString()
  @IsUUID()
  courseId: string;
}

