import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,

    @InjectRepository(QuizAttempt)
    private readonly submissionRepo: Repository<QuizAttempt>,
  ) {}

  // Create a new quiz
  create(createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepo.create(createQuizDto);
    return this.quizRepo.save(quiz);
  }

  // Get all quizzes
  findAll() {
    return this.quizRepo.find();
  }

  // Get a single quiz
  async findOne(id: number) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  // Update a quiz
  async update(id: number, updateQuizDto: UpdateQuizDto) {
    await this.quizRepo.update(id, updateQuizDto);
    return this.findOne(id);
  }

  // Delete a quiz
  async remove(id: number) {
    await this.quizRepo.delete(id);
    return { message: 'Quiz deleted' };
  }

  // Validate user's quiz submission
  async validateQuizSubmission(
    userId: string,
    quizId: string | number,
    submissionId?: string,
  ) {
    const quiz = await this.quizRepo.findOne({ where: { id: Number(quizId) } });

    if (!quiz) throw new NotFoundException('Quiz not found');

    const attempts = await this.submissionRepo.count({
      where: { userId: String(userId), quizId: String(quizId) },
    });
    if (attempts >= quiz.maxAttempts) {
      throw new ForbiddenException('Max attempts exceeded');
    }

    if (submissionId) {
      const submission = await this.submissionRepo.findOne({
        where: { id: submissionId },
      });
      if (!submission) throw new NotFoundException('Submission not found');

      const elapsed =
        (new Date().getTime() - new Date(submission.startTime).getTime()) /
        1000;
      if (quiz.timeLimit && elapsed > quiz.timeLimit) {
        throw new ForbiddenException('Time limit exceeded');
      }
    }
  }

  // Handle quiz submission
  async submitQuizAttempt(submissionId: string, dto: SubmitQuizAttemptDto) {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
      relations: ['quiz'],
    });

    if (!submission) throw new NotFoundException('Submission not found');

    const now = new Date();
    const elapsed =
      (now.getTime() - new Date(submission.startTime).getTime()) / 1000;

    if (submission.quiz.timeLimit && elapsed > submission.quiz.timeLimit) {
      throw new ForbiddenException('Time limit exceeded');
    }

    submission.answers = dto.answers;
    submission.endTime = now;

    return this.submissionRepo.save(submission);
  }

  async startQuizAttempt(userId: string, quizId: string) {
    const quiz = await this.quizRepo.findOne({ where: { id: Number(quizId) } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const attempts = await this.submissionRepo.count({
      where: { userId, quizId },
    });
    if (attempts >= quiz.maxAttempts) {
      throw new ForbiddenException('Max attempts exceeded');
    }

    const submission = this.submissionRepo.create({
      userId,
      quizId,
      attemptNumber: attempts + 1,
      startTime: new Date(),
    });

    return this.submissionRepo.save(submission);
  }
}
