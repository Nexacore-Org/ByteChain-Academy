import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizDto } from './create-quiz.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {}

