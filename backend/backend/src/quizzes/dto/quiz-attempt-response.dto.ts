export class QuizAttemptResponseDto {
    id: string;
    userId: string;
    quizId: string;
    attemptNumber: number;
    score: number;
    isPassed: boolean;
    startTime: Date;
    endTime?: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }
  