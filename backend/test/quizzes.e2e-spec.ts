import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { User, UserRole } from '../src/users/entities/user.entity';
import { Course } from '../src/courses/entities/course.entity';
import { Lesson } from '../src/lessons/entities/lesson.entity';
import { Quiz } from '../src/quizzes/entities/quiz.entity';
import { QuizSubmission } from '../src/quizzes/entities/quiz-submission.entity';
import { QuestionType } from '../src/quizzes/entities/question.entity';

const PREFIX = '/api/v1';

describe('QuizzesController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;
  let courseId: string;
  let lessonId: string;
  let quizId: string;
  let question1Id: string;
  let question2Id: string;
  const createdQuizIds: string[] = [];
  const createdLessonIds: string[] = [];

  const createLessonAndQuiz = async (payload: {
    title: string;
    description?: string;
    maxAttempts?: number;
    questions: {
      text: string;
      type: QuestionType;
      options: string[];
      correctAnswer: string;
    }[];
  }) => {
    const lessonRepo = dataSource.getRepository(Lesson);
    const lesson = await lessonRepo.save(
      lessonRepo.create({
        title: `${payload.title} Lesson`,
        content: 'Test Lesson Content',
        courseId,
        order: createdLessonIds.length + 2,
      }),
    );
    createdLessonIds.push(lesson.id);

    const quizResponse = await request(app.getHttpServer())
      .post(`${PREFIX}/quizzes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: payload.title,
        description: payload.description ?? 'Test',
        maxAttempts: payload.maxAttempts,
        lessonId: lesson.id,
        questions: payload.questions,
      })
      .expect(201);

    createdQuizIds.push(quizResponse.body.id);
    return quizResponse.body;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post(`${PREFIX}/auth/register`)
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
    await dataSource
      .getRepository(User)
      .update(userId, { role: UserRole.ADMIN });

    // Create test course
    const courseResponse = await request(app.getHttpServer())
      .post(`${PREFIX}/courses`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Course',
        description: 'Test Course Description',
      });

    courseId = courseResponse.body.id;

    // Create test lesson directly via repository
    const lessonRepo = dataSource.getRepository(Lesson);
    const lesson = lessonRepo.create({
      title: 'Test Lesson',
      content: 'Test Lesson Content',
      courseId: courseId,
      order: 1,
    });
    const savedLesson = await lessonRepo.save(lesson);
    lessonId = savedLesson.id;

    // Create test quiz
    const quizResponse = await request(app.getHttpServer())
      .post(`${PREFIX}/quizzes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Quiz',
        description: 'Test Quiz Description',
        maxAttempts: 1,
        lessonId: lessonId,
        questions: [
          {
            text: 'What is 2 + 2?',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
          },
          {
            text: 'Is TypeScript a programming language?',
            type: QuestionType.TRUE_FALSE,
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
        ],
      });

    quizId = quizResponse.body.id;
    createdQuizIds.push(quizId);
    question1Id = quizResponse.body.questions[0].id;
    question2Id = quizResponse.body.questions[1].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (dataSource) {
      const quizSubmissionRepo = dataSource.getRepository(QuizSubmission);
      const quizRepo = dataSource.getRepository(Quiz);
      const lessonRepo = dataSource.getRepository(Lesson);
      const courseRepo = dataSource.getRepository(Course);
      const userRepo = dataSource.getRepository(User);

      await quizSubmissionRepo.delete({ userId });
      for (const id of createdQuizIds) {
        await quizRepo.delete({ id });
      }
      for (const id of createdLessonIds) {
        await lessonRepo.delete({ id });
      }
      await lessonRepo.delete({ id: lessonId });
      await courseRepo.delete({ id: courseId });
      await userRepo.delete({ id: userId });
    }
    await app.close();
  });

  describe('POST /quizzes/:id/submit', () => {
    it('should successfully submit a quiz with correct answers', async () => {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${quizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [question1Id]: '4',
            [question2Id]: 'True',
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('quizId', quizId);
      expect(response.body.score).toBe(100);
      expect(response.body.totalQuestions).toBe(2);
      expect(response.body.correctAnswers).toBe(2);
      expect(response.body.passed).toBe(true);
      expect(response.body.attemptNumber).toBe(1);
      expect(response.body).toHaveProperty('submittedAt');
      expect(response.body).toHaveProperty('completedAt');
    });

    it('should reject submission without authentication', async () => {
      await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${quizId}/submit`)
        .send({
          answers: {
            [question1Id]: '4',
            [question2Id]: 'True',
          },
        })
        .expect(401);
    });

    it('should reject submissions beyond maxAttempts with a descriptive limit message', async () => {
      const newQuiz = await createLessonAndQuiz({
        title: 'Attempt Limit Test Quiz',
        maxAttempts: 1,
        questions: [
          {
            text: 'Test Question',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const newQuizId = newQuiz.id;
      const newQuestionId = newQuiz.questions[0].id;

      // First submission
      await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestionId]: 'A',
          },
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestionId]: 'A',
          },
        })
        .expect(409);

      expect(response.body.message).toContain('maximum attempt limit');
      expect(response.body.message).toContain('1 attempt');
    });

    it('should allow three submissions when maxAttempts is 3 and return attempt history', async () => {
      const newQuiz = await createLessonAndQuiz({
        title: 'Three Attempts Test Quiz',
        maxAttempts: 3,
        questions: [
          {
            text: 'Test Question',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const newQuizId = newQuiz.id;
      const newQuestionId = newQuiz.questions[0].id;
      const answers = { [newQuestionId]: 'A' };

      for (const attemptNumber of [1, 2, 3]) {
        const response = await request(app.getHttpServer())
          .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ answers })
          .expect(201);

        expect(response.body.attemptNumber).toBe(attemptNumber);
      }

      await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answers })
        .expect(409);

      const attemptsResponse = await request(app.getHttpServer())
        .get(`${PREFIX}/quizzes/${newQuizId}/attempts`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(attemptsResponse.body).toHaveLength(3);
      expect(
        attemptsResponse.body.map((attempt) => attempt.attemptNumber),
      ).toEqual([1, 2, 3]);
      expect(attemptsResponse.body[0]).toEqual(
        expect.objectContaining({
          attemptNumber: 1,
          score: 100,
          passed: true,
        }),
      );
      expect(attemptsResponse.body[0]).toHaveProperty('completedAt');
    });

    it('should reject submission with missing answers', async () => {
      const newQuiz = await createLessonAndQuiz({
        title: 'Missing Answers Test Quiz',
        questions: [
          {
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
          {
            text: 'Question 2',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const newQuizId = newQuiz.id;
      const newQuestion1Id = newQuiz.questions[0].id;

      await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestion1Id]: 'A',
            // Missing second question
          },
        })
        .expect(400);
    });

    it('should calculate score correctly with wrong answers', async () => {
      const newQuiz = await createLessonAndQuiz({
        title: 'Wrong Answers Test Quiz',
        questions: [
          {
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
          {
            text: 'Question 2',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const newQuizId = newQuiz.id;
      const newQuestion1Id = newQuiz.questions[0].id;
      const newQuestion2Id = newQuiz.questions[1].id;

      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestion1Id]: 'B',
            [newQuestion2Id]: 'B',
          },
        })
        .expect(201);

      expect(response.body.score).toBe(0);
      expect(response.body.correctAnswers).toBe(0);
      expect(response.body.passed).toBe(false);
    });

    it('should calculate score correctly with partial answers (50%)', async () => {
      const newQuiz = await createLessonAndQuiz({
        title: 'Partial Answers Test Quiz',
        questions: [
          {
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
          {
            text: 'Question 2',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const newQuizId = newQuiz.id;
      const newQuestion1Id = newQuiz.questions[0].id;
      const newQuestion2Id = newQuiz.questions[1].id;

      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestion1Id]: 'A',
            [newQuestion2Id]: 'B',
          },
        })
        .expect(201);

      expect(response.body.score).toBe(50);
      expect(response.body.correctAnswers).toBe(1);
      expect(response.body.passed).toBe(false); // Below 70% threshold
    });
  });

  describe('GET /quizzes/:id/submission', () => {
    it('should return user submission for a quiz', async () => {
      // First submit a quiz
      const newQuiz = await createLessonAndQuiz({
        title: 'Get Submission Test Quiz',
        questions: [
          {
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const newQuizId = newQuiz.id;
      const newQuestionId = newQuiz.questions[0].id;

      await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestionId]: 'A',
          },
        });

      // Get the submission
      const response = await request(app.getHttpServer())
        .get(`${PREFIX}/quizzes/${newQuizId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('quizId', newQuizId);
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('submittedAt');
      expect(response.body).toHaveProperty('completedAt');
    });

    it('should return null if no submission exists', async () => {
      const newQuiz = await createLessonAndQuiz({
        title: 'No Submission Test Quiz',
        questions: [
          {
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const newQuizId = newQuiz.id;

      const response = await request(app.getHttpServer())
        .get(`${PREFIX}/quizzes/${newQuizId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('GET /quizzes/submissions/my', () => {
    it('should return all user submissions', async () => {
      // Create and submit multiple quizzes
      const quiz1 = await createLessonAndQuiz({
        title: 'My Submissions Quiz 1',
        questions: [
          {
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        ],
      });

      const quiz1Id = quiz1.id;
      const quiz1QuestionId = quiz1.questions[0].id;

      await request(app.getHttpServer())
        .post(`${PREFIX}/quizzes/${quiz1Id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [quiz1QuestionId]: 'A',
          },
        });

      const response = await request(app.getHttpServer())
        .get(`${PREFIX}/quizzes/submissions/my`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('userId', userId);
      expect(response.body[0]).toHaveProperty('score');
    });
  });
});
