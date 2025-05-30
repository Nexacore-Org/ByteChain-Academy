import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizzesService } from '../quizzes.service';
import { Quiz } from '../entities/quiz.entity';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('QuizzesService', () => {
  let service: QuizzesService;
  let repository: MockRepository<Quiz>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        {
          provide: getRepositoryToken(Quiz),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<QuizzesService>(QuizzesService);
    repository = module.get<MockRepository<Quiz>>(getRepositoryToken(Quiz));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new quiz', async () => {
      const createQuizDto: CreateQuizDto = {
        lessonId: 1,
        title: 'Test Quiz',
        description: 'Test Description',
        type: 'multiple_choice',
        difficulty: 'medium',
        status: 'published',
        totalQuestions: 10,
        passingScore: 70,
        timeLimit: 30,
        maxAttempts: 3,
      };

      const quiz = { id: 1, ...createQuizDto } as Quiz;

      repository.create.mockReturnValue(quiz);
      repository.save.mockResolvedValue(quiz);

      const result = await service.create(createQuizDto);

      expect(repository.create).toHaveBeenCalledWith(createQuizDto);
      expect(repository.save).toHaveBeenCalledWith(quiz);
      expect(result).toEqual(quiz);
    });
  });

  describe('findAll', () => {
    it('should return an array of quizzes', async () => {
      const quizzes = [{ id: 1 }, { id: 2 }] as Quiz[];
      repository.find.mockResolvedValue(quizzes);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(quizzes);
    });
  });

  describe('findOne', () => {
    it('should return a quiz when quiz exists', async () => {
      const quiz = { id: 1 } as Quiz;
      repository.findOne.mockResolvedValue(quiz);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['questions', 'attempts'],
      });
      expect(result).toEqual(quiz);
    });

    it('should throw NotFoundException when quiz does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  // describe('findByLessonId', () => {
  //   it('should return quizzes for a specific lesson', async () => {
  //     const quizzes = [{ id: 1, lessonId: 1 }] as Quiz[];
  //     repository.find.mockResolvedValue(quizzes);

  //     const result = await service.findByLessonId(1);

  //     expect(repository.find).toHaveBeenCalledWith({
  //       where: { lessonId: 1 },
  //       relations: ['questions']
  //     });
  //     expect(result).toEqual(quizzes);
  //   });
  // });

  describe('update', () => {
    it('should update a quiz', async () => {
      const quiz = {
        id: 1,
        title: 'Original Title',
        description: 'Original Description',
      } as Quiz;

      const updateQuizDto = {
        title: 'Updated Title',
      };

      const updatedQuiz = {
        ...quiz,
        ...updateQuizDto,
      };

      repository.findOne.mockResolvedValue(quiz);
      repository.save.mockResolvedValue(updatedQuiz);

      const result = await service.update(1, updateQuizDto);

      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith({
        ...quiz,
        ...updateQuizDto,
      });
      expect(result).toEqual(updatedQuiz);
    });

    it('should throw NotFoundException when quiz does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a quiz', async () => {
      const quiz = { id: 1 } as Quiz;
      repository.findOne.mockResolvedValue(quiz);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.remove).toHaveBeenCalledWith(quiz);
    });

    it('should throw NotFoundException when quiz does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
