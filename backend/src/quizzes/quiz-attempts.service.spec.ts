import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizAttemptsService } from './quiz-attempt.services';

// Mock repository factory
const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

describe('QuizAttemptsService', () => {
  let service: QuizAttemptsService;
  let quizAttemptRepository: Repository<QuizAttempt>;
  let quizRepository: Repository<Quiz>;
  let quizQuestionRepository: Repository<QuizQuestion>;

  const mockQuiz = {
    id: 'quiz-uuid',
    title: 'Test Quiz',
    maxAttempts: 3,
    timeLimit: 30, // in minutes
    passingScore: 70,
  };

  const mockQuestions = [
    {
      id: 1,
      quizId: 'quiz-uuid',
      questionText: 'What is 2+2?',
      questionType: 'text',
      points: 10,
      order: 1,
      correctAnswer: ['4'],
    },
    {
      id: 2,
      quizId: 'quiz-uuid',
      questionText: 'Which are prime numbers?',
      questionType: 'multiple_choice',
      points: 15,
      order: 2,
      correctAnswer: ['2', '3', '5', '7'],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAttemptsService,
        {
          provide: getRepositoryToken(QuizAttempt),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Quiz),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(QuizQuestion),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<QuizAttemptsService>(QuizAttemptsService);
    quizAttemptRepository = module.get<Repository<QuizAttempt>>(getRepositoryToken(QuizAttempt));
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    quizQuestionRepository = module.get<Repository<QuizQuestion>>(getRepositoryToken(QuizQuestion));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startQuizAttempt', () => {
    it('should create a new quiz attempt', async () => {
      const userId = 'user-uuid';
      const quizId = 'quiz-uuid';
      
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(mockQuiz as any);
      jest.spyOn(quizAttemptRepository, 'count').mockResolvedValue(0);
      jest.spyOn(quizAttemptRepository, 'create').mockReturnValue({
        userId,
        quizId,
        attemptNumber: 1,
      } as any);
      jest.spyOn(quizAttemptRepository, 'save').mockImplementation(entity => Promise.resolve({
        id: 'attempt-uuid',
        ...entity,
      } as any));

      const result = await service.startQuizAttempt({ userId, quizId });
      
      expect(quizRepository.findOne).toHaveBeenCalled();
      expect(quizAttemptRepository.count).toHaveBeenCalled();
      expect(quizAttemptRepository.create).toHaveBeenCalled();
      expect(quizAttemptRepository.save).toHaveBeenCalled();
      expect(result.attemptNumber).toBe(1);
      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundException when quiz not found', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(null);
      
      await expect(service.startQuizAttempt({
        userId: 'user-uuid',
        quizId: 'non-existent-quiz',
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when max attempts exceeded', async () => {
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(mockQuiz as any);
      jest.spyOn(quizAttemptRepository, 'count').mockResolvedValue(3); // Already has 3 attempts
      
      await expect(service.startQuizAttempt({
        userId: 'user-uuid',
        quizId: 'quiz-uuid',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitQuizAttempt', () => {
    const mockAttempt = {
      id: 'attempt-uuid',
      userId: 'user-uuid',
      quizId: 'quiz-uuid',
      attemptNumber: 1,
      score: 0,
      isPassed: false,
      startTime: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      status: 'in_progress',
      answers: {},
      quiz: mockQuiz,
      endTime: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as QuizAttempt;

    it('should score a quiz attempt correctly', async () => {
      const answers = {
        '1': ['4'],
        '2': ['2', '3', '5', '7'],
      };
      
      jest.spyOn(service, 'getQuizAttempt').mockResolvedValue(mockAttempt);
      jest.spyOn(quizQuestionRepository, 'find').mockResolvedValue(mockQuestions as any);
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(mockQuiz as any);
      jest.spyOn(quizAttemptRepository, 'save').mockImplementation(entity => Promise.resolve({
        ...entity,
        status: 'completed',
        endTime: expect.any(Date),
      } as any));

      const result = await service.submitQuizAttempt('attempt-uuid', { answers });
      
      expect(result.status).toBe('completed');
      expect(result.score).toBe(100); // All answers correct
      expect(result.isPassed).toBe(true);
    });

    it('should mark attempt as timed out if time limit exceeded', async () => {
      const timedOutAttempt = {
        ...mockAttempt,
        startTime: new Date(Date.now() - 1000 * 60 * 60), // 60 minutes ago (exceeds 30 min limit)
      };
      
      jest.spyOn(service, 'getQuizAttempt').mockResolvedValue(timedOutAttempt);
      jest.spyOn(quizQuestionRepository, 'find').mockResolvedValue(mockQuestions as any);
      jest.spyOn(quizRepository, 'findOne').mockResolvedValue(mockQuiz as any);
      jest.spyOn(quizAttemptRepository, 'save').mockImplementation(entity => Promise.resolve({
        ...entity,
        status: 'timed_out',
      } as any));

      const result = await service.submitQuizAttempt('attempt-uuid', { answers: {} });
      
      expect(result.status).toBe('timed_out');
    });

    it('should throw BadRequestException when submitting an already completed attempt', async () => {
      const completedAttempt = {
        ...mockAttempt,
        status: 'completed',
      };
      
      jest.spyOn(service, 'getQuizAttempt').mockResolvedValue(completedAttempt);
      
      await expect(service.submitQuizAttempt('attempt-uuid', { answers: {} }))
        .rejects.toThrow(BadRequestException);
    });
  });
  
  describe('getQuizAttempt', () => {
    it('should return the quiz attempt if found', async () => {
      const mockAttempt = { id: 'attempt-uuid', status: 'in_progress' };
      jest.spyOn(quizAttemptRepository, 'findOne').mockResolvedValue(mockAttempt as any);
      
      const result = await service.getQuizAttempt('attempt-uuid');
      
      expect(result).toEqual(mockAttempt);
    });
    
    it('should throw NotFoundException if quiz attempt not found', async () => {
      jest.spyOn(quizAttemptRepository, 'findOne').mockResolvedValue(null);
      
      await expect(service.getQuizAttempt('non-existent-attempt'))
        .rejects.toThrow(NotFoundException);
    });
  });
  
  describe('getUserQuizAttempts', () => {
    it('should return user quiz attempts in descending order', async () => {
      const mockAttempts = [
        { id: 'attempt-2', attemptNumber: 2 },
        { id: 'attempt-1', attemptNumber: 1 },
      ];
      
      jest.spyOn(quizAttemptRepository, 'find').mockResolvedValue(mockAttempts as any);
      
      const result = await service.getUserQuizAttempts('user-uuid', 'quiz-uuid');
      
      expect(result).toEqual(mockAttempts);
      expect(quizAttemptRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid', quizId: 'quiz-uuid' },
        order: { attemptNumber: 'DESC' },
      });
    });
  });
});