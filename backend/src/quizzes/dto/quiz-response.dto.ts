import { QuestionType } from '../entities/question.entity';
import { ApiProperty } from '@nestjs/swagger';

export class QuizSubmissionResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  id: string;
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'userId field',
  })
  userId: string;
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'quizId field',
  })
  quizId: string;
  @ApiProperty({ example: 1, description: 'attemptNumber field' })
  attemptNumber: number;
  @ApiProperty({ example: 1, description: 'score field' })
  score: number;
  @ApiProperty({ example: 1, description: 'totalQuestions field' })
  totalQuestions: number;
  @ApiProperty({ example: 1, description: 'correctAnswers field' })
  correctAnswers: number;
  @ApiProperty({ example: true, description: 'passed field' })
  passed: boolean;
  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'submittedAt field',
  })
  submittedAt: Date;
  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'completedAt field',
  })
  completedAt: Date;

  constructor(submission: any) {
    this.id = submission.id;
    this.userId = submission.userId;
    this.quizId = submission.quizId;
    this.attemptNumber = submission.attemptNumber;
    this.score = submission.score;
    this.totalQuestions = submission.totalQuestions;
    this.correctAnswers = submission.correctAnswers;
    this.passed = submission.passed;
    this.submittedAt = submission.submittedAt;
    this.completedAt = submission.completedAt ?? submission.submittedAt;
  }
}

export class QuestionResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  id: string;
  @ApiProperty({ example: 'example', description: 'text field' })
  text: string;
  @ApiProperty({ example: 'example', description: 'type field' })
  type: QuestionType;
  @ApiProperty({
    example: ['Option 1', 'Option 2'],
    description: 'options field',
  })
  options: string[];
}

export class QuizResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  id: string;
  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  title: string;
  @ApiProperty({
    example: 'A concise description of the resource.',
    description: 'description field',
  })
  description: string;
  @ApiProperty({
    example: 3,
    description: 'Maximum allowed attempts per student',
  })
  maxAttempts: number;
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'lessonId field',
  })
  lessonId: string;
  @ApiProperty({
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'What is blockchain?',
        type: 'multiple-choice',
        options: ['Option 1', 'Option 2'],
      },
    ],
    description: 'questions field',
  })
  questions: QuestionResponseDto[];

  constructor(quiz: any) {
    this.id = quiz.id;
    this.title = quiz.title;
    this.description = quiz.description;
    this.maxAttempts = quiz.maxAttempts;
    this.lessonId = quiz.lessonId;
    this.questions =
      quiz.questions?.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
      })) || [];
  }
}

export class AdminQuizResponseDto extends QuizResponseDto {
  @ApiProperty({
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'What is blockchain?',
        type: 'multiple-choice',
        options: ['Option 1', 'Option 2'],
        correctAnswer: 'Option 1',
      },
    ],
    description: 'questions field',
  })
  questions: (QuestionResponseDto & { correctAnswer: string })[];

  constructor(quiz: any) {
    super(quiz);
    this.questions =
      quiz.questions?.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })) || [];
  }
}
