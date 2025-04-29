
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from './entities/quiz-question.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { AppModule } from 'src/app.module';

describe('Quiz Attempts (e2e)', () => {
  let app: INestApplication;
  let quizRepository: Repository<Quiz>;
  let questionRepository: Repository<QuizQuestion>;
  let attemptRepository: Repository<QuizAttempt>;
  
  let accessToken: string;
  let user: any;
  let quiz: Quiz;
  let attempt: QuizAttempt;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    
    // Get necessary services/repositories
    // authService = moduleFixture.get<AuthService>(AuthService);
    quizRepository = moduleFixture.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    questionRepository = moduleFixture.get<Repository<QuizQuestion>>(getRepositoryToken(QuizQuestion));
    attemptRepository = moduleFixture.get<Repository<QuizAttempt>>(getRepositoryToken(QuizAttempt));
    
    // Create test user
    // user = await authService.createUser({
    //   email: 'test@example.com',
    //   password: 'Test123!',
    //   fullName: 'Test User',
    // });
    
    // Generate JWT for test user
    // const { access_token } = await authService.login({
    //   email: 'test@example.com',
    //   password: 'Test123!',
    // });
    
    // accessToken = access_token;
    
    // // Create test quiz with questions
    // quiz = await quizRepository.save({
    //   title: 'Test Quiz',
    //   description: 'E2E Test Quiz',
    //   timeLimit: 30,
    //   passingScore: 70,
    //   maxAttempts: 3,
    // });
    
    // Create test questions
    await questionRepository.save([
      {
        quizId: quiz.id,
        questionText: 'What is 2+2?',
        questionType: 'text',
        points: 10,
        order: 1,
        correctAnswer: ['4'],
      },
      {
        quizId: quiz.id,
        questionText: 'Which are prime numbers?',
        questionType: 'multiple_choice',
        points: 15,
        order: 2,
        correctAnswer: ['2', '3', '5', '7'],
      },
    ]);
  });
  
  afterAll(async () => {
    // Clean up
    await attemptRepository.delete({});
    await questionRepository.delete({});
    await quizRepository.delete({});
    await app.close();
  });
  
  describe('/quizzes/attempts/start (POST)', () => {
    it('should create a new quiz attempt', async () => {
      const response = await request(app.getHttpServer())
        .post('/quizzes/attempts/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user.id,
          quizId: quiz.id,
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('attemptNumber', 1);
      expect(response.body).toHaveProperty('status', 'in_progress');
      
      attempt = response.body;
    });
    
    it('should reject creating attempt for another user', async () => {
      return request(app.getHttpServer())
        .post('/quizzes/attempts/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: 'other-user-id',
          quizId: quiz.id,
        })
        .expect(403);
    });
  });
  
  describe('/quizzes/attempts/:id (GET)', () => {
    it('should get a quiz attempt by id', async () => {
      return request(app.getHttpServer())
        .get(`/quizzes/attempts/${attempt.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', attempt.id);
        });
    });
    
    it('should reject accessing non-existent attempt', async () => {
      return request(app.getHttpServer())
        .get('/quizzes/attempts/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
  
  describe('/quizzes/attempts/:id/submit (PUT)', () => {
    it('should submit and score a quiz attempt', async () => {
      const answers = {
        '1': ['4'],
        '2': ['2', '3', '5', '7'],
      };
      
      return request(app.getHttpServer())
        .put(`/quizzes/attempts/${attempt.id}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ answers })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id', attempt.id);
          expect(res.body).toHaveProperty('status', 'completed');
          expect(res.body).toHaveProperty('score', 100); // All correct
          expect(res.body).toHaveProperty('isPassed', true);
          expect(res.body).toHaveProperty('endTime');
        });
    });
    
    it('should reject submitting an already completed attempt', async () => {
      return request(app.getHttpServer())
        .put(`/quizzes/attempts/${attempt.id}/submit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ answers: {} })
        .expect(400);
    });
  });
  
  describe('/quizzes/user/attempts (GET)', () => {
    it('should get all attempts for the current user and quiz', async () => {
      return request(app.getHttpServer())
        .get(`/quizzes/user/attempts?quizId=${quiz.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id', attempt.id);
        });
    });
  });
});