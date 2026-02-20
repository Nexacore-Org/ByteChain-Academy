import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsUrl,
} from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUrl({}, { message: 'videoUrl must be a valid URL' })
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @Min(0, { message: 'videoStartTimestamp must be a non-negative number' })
  @IsOptional()
  videoStartTimestamp?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
