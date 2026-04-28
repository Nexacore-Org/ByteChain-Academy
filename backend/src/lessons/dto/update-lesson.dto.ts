import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
