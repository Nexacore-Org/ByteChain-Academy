import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateQuizAttemptDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  quizId: string;
}