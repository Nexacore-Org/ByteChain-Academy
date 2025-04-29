import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionAnswers {
  [questionId: string]: string[];
}

export class SubmitQuizAttemptDto {
  @IsNotEmpty()
  @IsObject()
  answers: Record<string, string[]>;
}