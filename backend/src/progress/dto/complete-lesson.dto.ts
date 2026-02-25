import { IsString, IsUUID } from 'class-validator';

export class CompleteLessonDto {
  @IsString()
  @IsUUID()
  lessonId: string;

  @IsString()
  @IsUUID()
  courseId: string;
}
