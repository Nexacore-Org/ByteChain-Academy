/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ProgressModule } from './progress.module';
import { INestApplication } from '@nestjs/common';

describe('ProgressController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProgressModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/progress/student/:studentId/course/:courseId (GET)', () => {
    return request(app.getHttpServer())
      .get('/progress/student/1/course/1')
      .expect(200)
      .expect({ completedLessons: 5, completedQuizzes: 3 });
  });

  afterAll(async () => {
    await app.close();
  });
});
