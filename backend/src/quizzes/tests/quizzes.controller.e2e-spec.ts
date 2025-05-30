import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuizzesModule } from '../quizzes.module';
import { QuizzesService } from '../quizzes.service';
import { Quiz } from '../entities/quiz.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateQuizDto } from '../dto/create-quiz.dto';

describe('QuizzesController (e2e)', () => {
  let app: INestApplication;
  let service: QuizzesService;

  // Mock JWT Auth Guard
  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [QuizzesModule],
    })
      .overrideProvider(getRepositoryToken(Quiz))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
      })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    service = moduleFixture.get<QuizzesService>(QuizzesService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/quizzes (GET) should return all quizzes', async () => {
    const mockQuizzes = [
      {
        id: 1,
        lessonId: 1,
        title: 'Test Quiz 1',
        description: 'Description 1',
        type: 'multiple_choice',
        difficulty: 'easy',
        status: 'published',
        totalQuestions: 10,
        passingScore: 70,
        timeLimit: 30,
        maxAttempts: 3,
      },
      {
        id: 2,
        lessonId: 1,
        title: 'Test Quiz 2',
        description: 'Description 2',
        type: 'true_false',
        difficulty: 'medium',
        status: 'draft',
        totalQuestions: 5,
        passingScore: 60,
        timeLimit: 15,
        maxAttempts: 2,
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(mockQuizzes as Quiz[]);

    return request(app.getHttpServer())
      .get('/quizzes')
      .expect(200)
      .expect(mockQuizzes);
  });

  it('/quizzes/:id (GET) should return a quiz by id', async () => {
    const mockQuiz = {
      id: 1,
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

    jest.spyOn(service, 'findOne').mockResolvedValue(mockQuiz as Quiz);

    return request(app.getHttpServer())
      .get('/quizzes/1')
      .expect(200)
      .expect(mockQuiz);
  });

  it('/quizzes/lesson/:lessonId (GET) should return quizzes by lesson id', async () => {
    const mockQuizzes = [
      {
        id: 1,
        lessonId: 1,
        title: 'Test Quiz 1',
        description: 'Description 1',
        type: 'multiple_choice',
        difficulty: 'easy',
        status: 'published',
        totalQuestions: 10,
        passingScore: 70,
        timeLimit: 30,
        maxAttempts: 3,
      },
    ];

    jest
      .spyOn(service, 'findByLessonId')
      .mockResolvedValue(mockQuizzes as Quiz[]);

    return request(app.getHttpServer())
      .get('/quizzes/lesson/1')
      .expect(200)
      .expect(mockQuizzes);
  });

  it('/quizzes (POST) should create a new quiz', async () => {
    const createQuizDto: CreateQuizDto = {
      lessonId: 1,
      title: 'New Quiz',
      description: 'New Quiz Description',
      type: 'multiple_choice',
      difficulty: 'easy',
      status: 'draft',
      totalQuestions: 5,
      passingScore: 60,
      timeLimit: 15,
      maxAttempts: 2,
    };

    const createdQuiz = { id: 1, ...createQuizDto };

    jest.spyOn(service, 'create').mockResolvedValue(createdQuiz as Quiz);

    return request(app.getHttpServer())
      .post('/quizzes')
      .send(createQuizDto)
      .expect(201)
      .expect(createdQuiz);
  });

  it('/quizzes/:id (PATCH) should update a quiz', async () => {
    const updateQuizDto = {
      title: 'Updated Quiz Title',
      description: 'Updated Quiz Description',
    };

    const updatedQuiz = {
      id: 1,
      lessonId: 1,
      title: 'Updated Quiz Title',
      description: 'Updated Quiz Description',
      type: 'multiple_choice',
      difficulty: 'medium',
      status: 'published',
      totalQuestions: 10,
      passingScore: 70,
      timeLimit: 30,
      maxAttempts: 3,
    };

    jest.spyOn(service, 'update').mockResolvedValue(updatedQuiz as Quiz);

    return request(app.getHttpServer())
      .patch('/quizzes/1')
      .send(updateQuizDto)
      .expect(200)
      .expect(updatedQuiz);
  });

  it('/quizzes/:id (DELETE) should delete a quiz', async () => {
    jest.spyOn(service, 'remove').mockResolvedValue(undefined);

    return request(app.getHttpServer()).delete('/quizzes/1').expect(200);
  });

  it('should validate the CreateQuizDto', async () => {
    const invalidDto = {
      // Missing required fields
      title: '',
      // Invalid values
      passingScore: 110, // Over 100
      timeLimit: -10, // Negative
    };

    return request(app.getHttpServer())
      .post('/quizzes')
      .send(invalidDto)
      .expect(400); // Bad request due to validation errors
  });
});
