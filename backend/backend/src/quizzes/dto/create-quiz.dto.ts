import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum QuizTypeEnum {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  MIXED = 'mixed',
}

export enum QuizDifficultyEnum {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuizStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateQuizDto {
  @ApiProperty({ description: 'The lesson ID this quiz is associated with' })
  @IsNumber()
  @IsNotEmpty()
  lessonId: number;

  @ApiProperty({ description: 'Title of the quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the quiz', required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ 
    description: 'Type of quiz', 
    enum: QuizTypeEnum 
  })
  @IsEnum(QuizTypeEnum)
  @IsNotEmpty()
  type: string;

  @ApiProperty({ 
    description: 'Difficulty level of the quiz', 
    enum: QuizDifficultyEnum 
  })
  @IsEnum(QuizDifficultyEnum)
  @IsNotEmpty()
  difficulty: string;

  @ApiProperty({ 
    description: 'Status of the quiz', 
    enum: QuizStatusEnum 
  })
  @IsEnum(QuizStatusEnum)
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'Total number of questions in the quiz' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  totalQuestions: number;

  @ApiProperty({ description: 'Minimum score required to pass the quiz (percentage)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  passingScore: number;

  @ApiProperty({ description: 'Time limit for quiz completion (in minutes)' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  timeLimit: number;

  @ApiProperty({ description: 'Maximum number of attempts allowed' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  maxAttempts: number;
}

and if there is something it the file, just update it with the code I sent