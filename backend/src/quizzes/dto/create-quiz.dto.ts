import { IsString, IsNotEmpty, IsIn, IsNumber, Min, Max } from 'class-validator';

export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsIn(['multiple-choice', 'true-false', 'short-answer'])
    type: string;

    @IsString()
    @IsIn(['easy', 'medium', 'hard'])
    difficulty: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    passingScore: number;

    @IsNumber()
    @Min(1)
    maxAttempts: number;
}