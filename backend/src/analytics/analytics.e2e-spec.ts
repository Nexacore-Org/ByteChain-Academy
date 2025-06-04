import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AnalyticsModule } from './analytics.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessonAnalytics } from './entities/lesson_analytics.entity';
import { QuizAnalytics } from './entities/quiz_analytics.entity';

describe('Analytics Endpoints (e2e)', () => {
  let app: INestApplication;
  let lessonAnalyticsRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn() };
  let quizAnalyticsRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn() };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AnalyticsModule],
    })
      .overrideProvider(getRepositoryToken(LessonAnalytics))
      .useValue(lessonAnalyticsRepo)
      .overrideProvider(getRepositoryToken(QuizAnalytics))
      .useValue(quizAnalyticsRepo)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /analytics/lesson-start', async () => {
    lessonAnalyticsRepo.create.mockReturnValue({ userId: 1, lessonId: 2, lessonStartTime: new Date() });
    lessonAnalyticsRepo.save.mockResolvedValue({ userId: 1, lessonId: 2, lessonStartTime: new Date() });
    await request(app.getHttpServer())
      .post('/analytics/lesson-start')
      .send({ lessonId: 2 })
      .set('Authorization', 'Bearer testtoken')
      .expect(201);
  });

  it('POST /analytics/lesson-end', async () => {
    lessonAnalyticsRepo.findOne.mockResolvedValue({ userId: 1, lessonId: 2, lessonStartTime: new Date(Date.now() - 1000) });
    lessonAnalyticsRepo.save.mockResolvedValue({ userId: 1, lessonId: 2, lessonStartTime: new Date(Date.now() - 1000), lessonEndTime: new Date(), durationSeconds: 1 });
    await request(app.getHttpServer())
      .post('/analytics/lesson-end')
      .send({ lessonId: 2 })
      .set('Authorization', 'Bearer testtoken')
      .expect(201);
  });

  it('POST /analytics/quiz-score', async () => {
    quizAnalyticsRepo.create.mockReturnValue({ userId: 1, lessonId: 2, quizId: 3, score: 90, attempt: 1 });
    quizAnalyticsRepo.save.mockResolvedValue({ userId: 1, lessonId: 2, quizId: 3, score: 90, attempt: 1 });
    await request(app.getHttpServer())
      .post('/analytics/quiz-score')
      .send({ lessonId: 2, quizId: 3, score: 90, attempt: 1 })
      .set('Authorization', 'Bearer testtoken')
      .expect(201);
  });

  it('GET /analytics/user/:userId', async () => {
    lessonAnalyticsRepo.find.mockResolvedValue([]);
    quizAnalyticsRepo.find.mockResolvedValue([]);
    await request(app.getHttpServer())
      .get('/analytics/user/1')
      .set('Authorization', 'Bearer testtoken')
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
