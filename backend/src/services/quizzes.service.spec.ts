import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { Lesson } from '../entities/lesson.entity';
import { QuizSubmission } from '../entities/quiz-submission.entity';
import { SubmitQuizDto } from '../dto/quiz.dto';
import { QuestionType } from '../entities/question.entity';

describe('QuizzesService', () => {
  let service: QuizzesService;
  let quizRepository: Repository<Quiz>;
  let questionRepository: Repository<Question>;
  let lessonRepository: Repository<Lesson>;
  let quizSubmissionRepository: Repository<QuizSubmission>;

  const mockQuizRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockQuestionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockLessonRepository = {
    findOne: jest.fn(),
  };

  const mockQuizSubmissionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        {
          provide: getRepositoryToken(Quiz),
          useValue: mockQuizRepository,
        },
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
        {
          provide: getRepositoryToken(QuizSubmission),
          useValue: mockQuizSubmissionRepository,
        },
      ],
    }).compile();

    service = module.get<QuizzesService>(QuizzesService);
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    questionRepository = module.get<Repository<Question>>(getRepositoryToken(Question));
    lessonRepository = module.get<Repository<Lesson>>(getRepositoryToken(Lesson));
    quizSubmissionRepository = module.get<Repository<QuizSubmission>>(
      getRepositoryToken(QuizSubmission),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitQuiz', () => {
    const userId = 'user-123';
    const quizId = 'quiz-123';
    const question1Id = 'question-1';
    const question2Id = 'question-2';

    const mockQuiz: Quiz = {
      id: quizId,
      title: 'Test Quiz',
      description: 'Test Description',
      lessonId: 'lesson-123',
      questions: [
        {
          id: question1Id,
          text: 'What is 2 + 2?',
          type: QuestionType.MULTIPLE_CHOICE,
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          quizId: quizId,
          quiz: null as any,
        },
        {
          id: question2Id,
          text: 'Is TypeScript a language?',
          type: QuestionType.TRUE_FALSE,
          options: ['True', 'False'],
          correctAnswer: 'True',
          quizId: quizId,
          quiz: null as any,
        },
      ],
      lesson: null as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully submit a quiz with all correct answers', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '4',
          [question2Id]: 'True',
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);
      mockQuizSubmissionRepository.create.mockReturnValue({
        userId,
        quizId,
        answers: submitDto.answers,
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        passed: true,
      });
      mockQuizSubmissionRepository.save.mockResolvedValue({
        id: 'submission-123',
        userId,
        quizId,
        answers: submitDto.answers,
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        passed: true,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.submitQuiz(userId, submitDto);

      expect(result.score).toBe(100);
      expect(result.correctAnswers).toBe(2);
      expect(result.totalQuestions).toBe(2);
      expect(result.passed).toBe(true);
      expect(mockQuizRepository.findOne).toHaveBeenCalledWith({
        where: { id: quizId },
        relations: ['questions'],
      });
      expect(mockQuizSubmissionRepository.findOne).toHaveBeenCalledWith({
        where: { userId, quizId },
      });
    });

    it('should throw NotFoundException if quiz does not exist', async () => {
      const submitDto: SubmitQuizDto = {
        quizId: 'non-existent',
        answers: {},
      };

      mockQuizRepository.findOne.mockResolvedValue(null);

      await expect(service.submitQuiz(userId, submitDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if user already submitted the quiz', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '4',
          [question2Id]: 'True',
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue({
        id: 'existing-submission',
        userId,
        quizId,
      });

      await expect(service.submitQuiz(userId, submitDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.submitQuiz(userId, submitDto)).rejects.toThrow(
        'You have already submitted this quiz',
      );
    });

    it('should throw BadRequestException if not all questions are answered', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '4',
          // Missing question2Id
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);

      await expect(service.submitQuiz(userId, submitDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.submitQuiz(userId, submitDto)).rejects.toThrow(
        'All questions must be answered',
      );
    });

    it('should throw BadRequestException if invalid question IDs are provided', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '4',
          'invalid-question-id': 'answer', // Invalid ID instead of question2Id
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);

      await expect(service.submitQuiz(userId, submitDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.submitQuiz(userId, submitDto)).rejects.toThrow(
        'Invalid question IDs',
      );
    });

    it('should calculate score correctly with wrong answers (0%)', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '3',
          [question2Id]: 'False',
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);
      mockQuizSubmissionRepository.create.mockReturnValue({
        userId,
        quizId,
        answers: submitDto.answers,
        score: 0,
        totalQuestions: 2,
        correctAnswers: 0,
        passed: false,
      });
      mockQuizSubmissionRepository.save.mockResolvedValue({
        id: 'submission-123',
        userId,
        quizId,
        answers: submitDto.answers,
        score: 0,
        totalQuestions: 2,
        correctAnswers: 0,
        passed: false,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.submitQuiz(userId, submitDto);

      expect(result.score).toBe(0);
      expect(result.correctAnswers).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('should calculate score correctly with partial answers (50%)', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '4',
          [question2Id]: 'False',
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);
      mockQuizSubmissionRepository.create.mockReturnValue({
        userId,
        quizId,
        answers: submitDto.answers,
        score: 50,
        totalQuestions: 2,
        correctAnswers: 1,
        passed: false,
      });
      mockQuizSubmissionRepository.save.mockResolvedValue({
        id: 'submission-123',
        userId,
        quizId,
        answers: submitDto.answers,
        score: 50,
        totalQuestions: 2,
        correctAnswers: 1,
        passed: false,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.submitQuiz(userId, submitDto);

      expect(result.score).toBe(50);
      expect(result.correctAnswers).toBe(1);
      expect(result.passed).toBe(false); // Below 70% threshold
    });

    it('should mark as passed when score is exactly 70%', async () => {
      const mockQuizWith10Questions: Quiz = {
        ...mockQuiz,
        questions: Array.from({ length: 10 }, (_, i) => ({
          id: `question-${i}`,
          text: `Question ${i}`,
          type: QuestionType.MULTIPLE_CHOICE,
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          quizId: quizId,
          quiz: null as any,
        })),
      };

      const submitDto: SubmitQuizDto = {
        quizId,
        answers: Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [
            `question-${i}`,
            i < 7 ? 'A' : 'B', // 7 correct out of 10 = 70%
          ]),
        ),
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuizWith10Questions);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);
      mockQuizSubmissionRepository.create.mockReturnValue({
        userId,
        quizId,
        answers: submitDto.answers,
        score: 70,
        totalQuestions: 10,
        correctAnswers: 7,
        passed: true,
      });
      mockQuizSubmissionRepository.save.mockResolvedValue({
        id: 'submission-123',
        userId,
        quizId,
        answers: submitDto.answers,
        score: 70,
        totalQuestions: 10,
        correctAnswers: 7,
        passed: true,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.submitQuiz(userId, submitDto);

      expect(result.score).toBe(70);
      expect(result.passed).toBe(true);
    });

    it('should handle case-insensitive answer comparison', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '4',
          [question2Id]: 'true', // lowercase
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);
      mockQuizSubmissionRepository.create.mockReturnValue({
        userId,
        quizId,
        answers: submitDto.answers,
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        passed: true,
      });
      mockQuizSubmissionRepository.save.mockResolvedValue({
        id: 'submission-123',
        userId,
        quizId,
        answers: submitDto.answers,
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        passed: true,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.submitQuiz(userId, submitDto);

      expect(result.score).toBe(100);
      expect(result.correctAnswers).toBe(2);
    });

    it('should handle answers with extra whitespace', async () => {
      const submitDto: SubmitQuizDto = {
        quizId,
        answers: {
          [question1Id]: '  4  ',
          [question2Id]: '  True  ',
        },
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);
      mockQuizSubmissionRepository.create.mockReturnValue({
        userId,
        quizId,
        answers: submitDto.answers,
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        passed: true,
      });
      mockQuizSubmissionRepository.save.mockResolvedValue({
        id: 'submission-123',
        userId,
        quizId,
        answers: submitDto.answers,
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        passed: true,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.submitQuiz(userId, submitDto);

      expect(result.score).toBe(100);
      expect(result.correctAnswers).toBe(2);
    });
  });

  describe('getUserSubmission', () => {
    it('should return submission if it exists', async () => {
      const userId = 'user-123';
      const quizId = 'quiz-123';
      const mockSubmission = {
        id: 'submission-123',
        userId,
        quizId,
        score: 100,
        totalQuestions: 2,
        correctAnswers: 2,
        passed: true,
        submittedAt: new Date(),
      };

      mockQuizSubmissionRepository.findOne.mockResolvedValue(mockSubmission);

      const result = await service.getUserSubmission(userId, quizId);

      expect(result).toEqual(mockSubmission);
      expect(mockQuizSubmissionRepository.findOne).toHaveBeenCalledWith({
        where: { userId, quizId },
      });
    });

    it('should return null if submission does not exist', async () => {
      const userId = 'user-123';
      const quizId = 'quiz-123';

      mockQuizSubmissionRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserSubmission(userId, quizId);

      expect(result).toBeNull();
    });
  });

  describe('getUserSubmissions', () => {
    it('should return all user submissions ordered by submittedAt DESC', async () => {
      const userId = 'user-123';
      const mockSubmissions = [
        {
          id: 'submission-1',
          userId,
          quizId: 'quiz-1',
          score: 100,
          submittedAt: new Date('2024-01-02'),
        },
        {
          id: 'submission-2',
          userId,
          quizId: 'quiz-2',
          score: 75,
          submittedAt: new Date('2024-01-01'),
        },
      ];

      mockQuizSubmissionRepository.find.mockResolvedValue(mockSubmissions);

      const result = await service.getUserSubmissions(userId);

      expect(result).toEqual(mockSubmissions);
      expect(mockQuizSubmissionRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['quiz'],
        order: { submittedAt: 'DESC' },
      });
    });
  });
});
