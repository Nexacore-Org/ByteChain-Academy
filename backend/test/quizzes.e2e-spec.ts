import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Course } from '../src/entities/course.entity';
import { Lesson } from '../src/entities/lesson.entity';
import { Quiz } from '../src/quizzes/entities/quiz.entity';
import { Question } from '../src/quizzes/entities/question.entity';
import { QuizSubmission } from '../src/quizzes/entities/quiz-submission.entity';
import { QuestionType } from '../src/quizzes/entities/question.entity';

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Create test course
    const courseResponse = await request(app.getHttpServer())
      .post('/courses')
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
      .post('/quizzes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Quiz',
        description: 'Test Quiz Description',
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
      await quizRepo.delete({ id: quizId });
      await lessonRepo.delete({ id: lessonId });
      await courseRepo.delete({ id: courseId });
      await userRepo.delete({ id: userId });
    }
    await app.close();
  });

  describe('POST /quizzes/:id/submit', () => {
    it('should successfully submit a quiz with correct answers', async () => {
      const response = await request(app.getHttpServer())
        .post(`/quizzes/${quizId}/submit`)
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
      expect(response.body).toHaveProperty('submittedAt');
    });

    it('should reject submission without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/quizzes/${quizId}/submit`)
        .send({
          answers: {
            [question1Id]: '4',
            [question2Id]: 'True',
          },
        })
        .expect(401);
    });

    it('should reject duplicate submission', async () => {
      // Create a new quiz for this test
      const newQuizResponse = await request(app.getHttpServer())
        .post('/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Duplicate Test Quiz',
          description: 'Test',
          lessonId: lessonId,
          questions: [
            {
              text: 'Test Question',
              type: QuestionType.MULTIPLE_CHOICE,
              options: ['A', 'B'],
              correctAnswer: 'A',
            },
          ],
        });

      const newQuizId = newQuizResponse.body.id;
      const newQuestionId = newQuizResponse.body.questions[0].id;

      // First submission
      await request(app.getHttpServer())
        .post(`/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestionId]: 'A',
          },
        })
        .expect(201);

      // Duplicate submission
      await request(app.getHttpServer())
        .post(`/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestionId]: 'A',
          },
        })
        .expect(409);

      // Cleanup
      await dataSource.getRepository(Quiz).delete({ id: newQuizId });
    });

    it('should reject submission with missing answers', async () => {
      const newQuizResponse = await request(app.getHttpServer())
        .post('/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Missing Answers Test Quiz',
          description: 'Test',
          lessonId: lessonId,
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

      const newQuizId = newQuizResponse.body.id;
      const newQuestion1Id = newQuizResponse.body.questions[0].id;

      await request(app.getHttpServer())
        .post(`/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestion1Id]: 'A',
            // Missing second question
          },
        })
        .expect(400);

      // Cleanup
      await dataSource.getRepository(Quiz).delete({ id: newQuizId });
    });

    it('should calculate score correctly with wrong answers', async () => {
      const newQuizResponse = await request(app.getHttpServer())
        .post('/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Wrong Answers Test Quiz',
          description: 'Test',
          lessonId: lessonId,
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

      const newQuizId = newQuizResponse.body.id;
      const newQuestion1Id = newQuizResponse.body.questions[0].id;
      const newQuestion2Id = newQuizResponse.body.questions[1].id;

      const response = await request(app.getHttpServer())
        .post(`/quizzes/${newQuizId}/submit`)
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

      // Cleanup
      await dataSource
        .getRepository(QuizSubmission)
        .delete({ quizId: newQuizId });
      await dataSource.getRepository(Quiz).delete({ id: newQuizId });
    });

    it('should calculate score correctly with partial answers (50%)', async () => {
      const newQuizResponse = await request(app.getHttpServer())
        .post('/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Partial Answers Test Quiz',
          description: 'Test',
          lessonId: lessonId,
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

      const newQuizId = newQuizResponse.body.id;
      const newQuestion1Id = newQuizResponse.body.questions[0].id;
      const newQuestion2Id = newQuizResponse.body.questions[1].id;

      const response = await request(app.getHttpServer())
        .post(`/quizzes/${newQuizId}/submit`)
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

      // Cleanup
      await dataSource
        .getRepository(QuizSubmission)
        .delete({ quizId: newQuizId });
      await dataSource.getRepository(Quiz).delete({ id: newQuizId });
    });
  });

  describe('GET /quizzes/:id/submission', () => {
    it('should return user submission for a quiz', async () => {
      // First submit a quiz
      const newQuizResponse = await request(app.getHttpServer())
        .post('/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Get Submission Test Quiz',
          description: 'Test',
          lessonId: lessonId,
          questions: [
            {
              text: 'Question 1',
              type: QuestionType.MULTIPLE_CHOICE,
              options: ['A', 'B'],
              correctAnswer: 'A',
            },
          ],
        });

      const newQuizId = newQuizResponse.body.id;
      const newQuestionId = newQuizResponse.body.questions[0].id;

      await request(app.getHttpServer())
        .post(`/quizzes/${newQuizId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [newQuestionId]: 'A',
          },
        });

      // Get the submission
      const response = await request(app.getHttpServer())
        .get(`/quizzes/${newQuizId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('quizId', newQuizId);
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('submittedAt');

      // Cleanup
      await dataSource
        .getRepository(QuizSubmission)
        .delete({ quizId: newQuizId });
      await dataSource.getRepository(Quiz).delete({ id: newQuizId });
    });

    it('should return null if no submission exists', async () => {
      const newQuizResponse = await request(app.getHttpServer())
        .post('/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'No Submission Test Quiz',
          description: 'Test',
          lessonId: lessonId,
          questions: [
            {
              text: 'Question 1',
              type: QuestionType.MULTIPLE_CHOICE,
              options: ['A', 'B'],
              correctAnswer: 'A',
            },
          ],
        });

      const newQuizId = newQuizResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/quizzes/${newQuizId}/submission`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeNull();

      // Cleanup
      await dataSource.getRepository(Quiz).delete({ id: newQuizId });
    });
  });

  describe('GET /quizzes/submissions/my', () => {
    it('should return all user submissions', async () => {
      // Create and submit multiple quizzes
      const quiz1Response = await request(app.getHttpServer())
        .post('/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Submissions Quiz 1',
          description: 'Test',
          lessonId: lessonId,
          questions: [
            {
              text: 'Question 1',
              type: QuestionType.MULTIPLE_CHOICE,
              options: ['A', 'B'],
              correctAnswer: 'A',
            },
          ],
        });

      const quiz1Id = quiz1Response.body.id;
      const quiz1QuestionId = quiz1Response.body.questions[0].id;

      await request(app.getHttpServer())
        .post(`/quizzes/${quiz1Id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: {
            [quiz1QuestionId]: 'A',
          },
        });

      const response = await request(app.getHttpServer())
        .get('/quizzes/submissions/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('userId', userId);
      expect(response.body[0]).toHaveProperty('score');

      // Cleanup
      await dataSource
        .getRepository(QuizSubmission)
        .delete({ quizId: quiz1Id });
      await dataSource.getRepository(Quiz).delete({ id: quiz1Id });
    });
  });
});
