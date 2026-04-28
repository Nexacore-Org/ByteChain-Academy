import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsUUID,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../entities/question.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'example', description: 'text field' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 'example', description: 'type field', required: false })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiProperty({ example: ['Option 1', 'Option 2'], description: 'options field', required: false })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 'example', description: 'correctAnswer field' })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}

export class CreateQuizDto {
  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A concise description of the resource.', description: 'description field', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'lessonId field', required: false })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: [{ text: 'What is blockchain?', type: 'multiple-choice', options: ['Option 1', 'Option 2'], correctAnswer: 'Option 1' }], description: 'questions field' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}

