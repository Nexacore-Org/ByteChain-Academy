import { PartialType } from '@nestjs/swagger';
import { CreateLessonDto } from './createLessonsDto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}