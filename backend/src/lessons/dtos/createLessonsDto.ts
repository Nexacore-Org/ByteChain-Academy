import { IsNotEmpty, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUrl()
  videoUrl: string;

  @IsNotEmpty()
  @IsUUID()
  courseId: string;
}