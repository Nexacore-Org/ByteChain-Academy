import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLessonDto {
  @ApiProperty({
    description: 'The ID of the lesson to complete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  lessonId: string;

  @ApiProperty({
    description: 'The ID of the course the lesson belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  courseId: string;
}
