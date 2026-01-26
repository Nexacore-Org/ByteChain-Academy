import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { Lesson } from '../entities/lesson.entity';
import { QuizSubmission } from '../entities/quiz-submission.entity';
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto } from '../dto/quiz.dto';

@Injectable()
export class QuizzesService {
    constructor(
        @InjectRepository(Quiz)
        private quizRepository: Repository<Quiz>,
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
        @InjectRepository(Lesson)
        private lessonRepository: Repository<Lesson>,
        @InjectRepository(QuizSubmission)
        private quizSubmissionRepository: Repository<QuizSubmission>,
    ) { }

    async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
        const lesson = await this.lessonRepository.findOne({ where: { id: createQuizDto.lessonId } });
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${createQuizDto.lessonId} not found`);
        }

        const existingQuiz = await this.quizRepository.findOne({ where: { lessonId: createQuizDto.lessonId } });
        if (existingQuiz) {
            throw new ConflictException(`Lesson already has an associated quiz`);
        }

        const quiz = this.quizRepository.create({
            title: createQuizDto.title,
            description: createQuizDto.description,
            lessonId: createQuizDto.lessonId,
        });

        const savedQuiz = await this.quizRepository.save(quiz);

        if (createQuizDto.questions && createQuizDto.questions.length > 0) {
            const questions = createQuizDto.questions.map(q =>
                this.questionRepository.create({ ...q, quizId: savedQuiz.id })
            );
            await this.questionRepository.save(questions);
            savedQuiz.questions = questions;
        }

        return savedQuiz;
    }

    async findByLessonId(lessonId: string): Promise<Quiz> {
        const quiz = await this.quizRepository.findOne({
            where: { lessonId },
            relations: ['questions'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz for lesson ID ${lessonId} not found`);
        }

        return quiz;
    }

    async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
        const quiz = await this.quizRepository.findOne({
            where: { id },
            relations: ['questions'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }

        if (updateQuizDto.title) quiz.title = updateQuizDto.title;
        if (updateQuizDto.description) quiz.description = updateQuizDto.description;

        if (updateQuizDto.questions) {
            // Simple approach: delete old questions and insert new ones
            await this.questionRepository.delete({ quizId: id });
            const questions = updateQuizDto.questions.map(q =>
                this.questionRepository.create({ ...q, quizId: id })
            );
            await this.questionRepository.save(questions);
            quiz.questions = questions;
        }

        return this.quizRepository.save(quiz);
    }

    async findOne(id: string): Promise<Quiz> {
        const quiz = await this.quizRepository.findOne({
            where: { id },
            relations: ['questions'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }

        return quiz;
    }

    async submitQuiz(userId: string, submitQuizDto: SubmitQuizDto): Promise<QuizSubmission> {
        // Check for duplicate submission first (fail fast optimization)
        const existingSubmission = await this.quizSubmissionRepository.findOne({
            where: { userId, quizId: submitQuizDto.quizId },
        });

        if (existingSubmission) {
            throw new ConflictException('You have already submitted this quiz');
        }

        // Check if quiz exists and load questions
        const quiz = await this.quizRepository.findOne({
            where: { id: submitQuizDto.quizId },
            relations: ['questions'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${submitQuizDto.quizId} not found`);
        }

        // Validate quiz has questions
        if (!quiz.questions || quiz.questions.length === 0) {
            throw new BadRequestException('Quiz has no questions');
        }

        // Validate that all questions are answered
        const questionIds = quiz.questions.map(q => q.id);
        const submittedQuestionIds = Object.keys(submitQuizDto.answers);

        // Check if all questions are answered
        if (submittedQuestionIds.length !== questionIds.length) {
            throw new BadRequestException('All questions must be answered');
        }

        // Check if all submitted question IDs are valid
        const invalidQuestionIds = submittedQuestionIds.filter(id => !questionIds.includes(id));
        if (invalidQuestionIds.length > 0) {
            throw new BadRequestException(`Invalid question IDs: ${invalidQuestionIds.join(', ')}`);
        }

        // Validate that answers are from the question's options list (case-insensitive)
        for (const question of quiz.questions) {
            const userAnswer = submitQuizDto.answers[question.id]?.trim();
            if (userAnswer) {
                const normalizedOptions = question.options.map(opt => opt.trim().toLowerCase());
                if (!normalizedOptions.includes(userAnswer.toLowerCase())) {
                    throw new BadRequestException(
                        `Answer for question "${question.text}" must be one of the provided options`
                    );
                }
            }
        }

        // Score the quiz
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        for (const question of quiz.questions) {
            const userAnswer = submitQuizDto.answers[question.id];
            if (userAnswer && userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                correctAnswers++;
            }
        }

        // Calculate score as percentage
        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        
        // Determine if passed (70% threshold)
        const passed = score >= 70;

        // Create and save submission
        const submission = this.quizSubmissionRepository.create({
            userId,
            quizId: submitQuizDto.quizId,
            answers: submitQuizDto.answers,
            score: parseFloat(score.toFixed(2)),
            totalQuestions,
            correctAnswers,
            passed,
        });

        const savedSubmission = await this.quizSubmissionRepository.save(submission);

        // TODO: Integrate with progress module when implemented
        // This submission can be used to update user progress and trigger rewards
        // Example: await this.progressService.updateProgress(userId, quiz.lessonId, passed);

        return savedSubmission;
    }

    async getUserSubmission(userId: string, quizId: string): Promise<QuizSubmission | null> {
        return this.quizSubmissionRepository.findOne({
            where: { userId, quizId },
        });
    }

    async getUserSubmissions(userId: string): Promise<QuizSubmission[]> {
        return this.quizSubmissionRepository.find({
            where: { userId },
            relations: ['quiz'],
            order: { submittedAt: 'DESC' },
        });
    }
}
