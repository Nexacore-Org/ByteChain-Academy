import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async startQuizAttempt(
    createQuizAttemptDto: CreateQuizAttemptDto,
  ): Promise<QuizAttempt> {
    const { userId, quizId } = createQuizAttemptDto;

    // Verify quiz exists
    const quiz = await this.quizRepository.findOne({
      where: { id: parseInt(quizId) },
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Check if there are previous attempts to determine the attempt number
    const previousAttempts = await this.quizAttemptRepository.count({
      where: { userId, quizId },
    });

    // Check if user has reached maximum allowed attempts
    if (quiz.maxAttempts && previousAttempts >= quiz.maxAttempts) {
      throw new BadRequestException(
        `Maximum allowed attempts (${quiz.maxAttempts}) reached for this quiz`,
      );
    }

    // Create new attempt
    const quizAttempt = this.quizAttemptRepository.create({
      userId,
      quizId,
      attemptNumber: previousAttempts + 1,
      score: 0,
      isPassed: false,
      startTime: new Date(),
      status: 'in_progress',
      answers: {},
    });

    return this.quizAttemptRepository.save(quizAttempt);
  }

  async getQuizAttempt(id: string): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptRepository.findOne({
      where: { id },
      relations: ['quiz'],
    });

    if (!attempt) {
      throw new NotFoundException(`Quiz attempt with ID ${id} not found`);
    }

    return attempt;
  }

  async submitQuizAttempt(
    id: string,
    submitDto: SubmitQuizAttemptDto,
  ): Promise<QuizAttempt> {
    const attempt = await this.getQuizAttempt(id);

    // Check if attempt is still in progress
    if (attempt.status !== 'in_progress') {
      throw new BadRequestException(
        'This quiz attempt has already been submitted',
      );
    }

    // Check time limit if applicable
    if (attempt.quiz.timeLimit) {
      const currentTime = new Date();
      const timeLimitMs = attempt.quiz.timeLimit * 60 * 1000; // Convert minutes to milliseconds
      const timeDiff = currentTime.getTime() - attempt.startTime.getTime();

      if (timeDiff > timeLimitMs) {
        attempt.status = 'timed_out';
        return this.scoreQuizAttempt(attempt, submitDto.answers);
      }
    }

    // Update attempt with submitted answers
    attempt.answers = submitDto.answers;
    attempt.endTime = new Date();
    attempt.status = 'completed';

    // Score the quiz
    return this.scoreQuizAttempt(attempt, submitDto.answers);
  }

  private async scoreQuizAttempt(
    attempt: QuizAttempt,
    answers: Record<string, string[]>,
  ): Promise<QuizAttempt> {
    // Get all questions for this quiz
    const questions = await this.quizQuestionRepository.find({
      where: { quizId: parseInt(attempt.quizId) },
    });

    if (questions.length === 0) {
      throw new NotFoundException(
        `No questions found for quiz with ID ${attempt.quizId}`,
      );
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    // Calculate score
    for (const question of questions) {
      totalPoints += question.points;

      // Skip scoring for unanswered questions
      if (!answers[question.id]) {
        continue;
      }

      const userAnswers = answers[question.id];

      // Simple exact match scoring for now - can be expanded based on question types
      if (
        this.compareAnswers(
          question.correctAnswer,
          userAnswers,
          question.questionType,
        )
      ) {
        earnedPoints += question.points;
      }
    }

    // Calculate percentage score
    attempt.score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Determine if passed (assuming passing threshold is stored in Quiz entity)
    const quiz = await this.quizRepository.findOne({
      where: { id: parseInt(attempt.quizId) },
    });
    attempt.isPassed = attempt.score >= (quiz.passingScore || 60); // Default to 60% if not specified

    return this.quizAttemptRepository.save(attempt);
  }

  private compareAnswers(
    correctAnswers: string[],
    userAnswers: string[],
    questionType: string,
  ): boolean {
    // Different comparison logic based on question type
    switch (questionType) {
      case 'multiple_choice':
        // For multiple choice, check exact match of the selected option(s)
        return this.arraysEqual(correctAnswers, userAnswers);

      case 'true_false':
        // For true/false, simple single value comparison
        return correctAnswers[0] === userAnswers[0];

      case 'text':
        // For text questions, check if trimmed lowercase versions match
        return (
          correctAnswers[0].trim().toLowerCase() ===
          userAnswers[0].trim().toLowerCase()
        );

      default:
        // Default to exact array equality
        return this.arraysEqual(correctAnswers, userAnswers);
    }
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((val, idx) => val === sortedB[idx]);
  }

  async getUserQuizAttempts(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]> {
    return this.quizAttemptRepository.find({
      where: { userId, quizId },
      order: { attemptNumber: 'DESC' },
    });
  }
}
