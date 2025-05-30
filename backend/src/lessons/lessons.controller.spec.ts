import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LessonsModule } from './lessons.module';

describe('LessonsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LessonsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/lessons (GET)', () => {
    return request(app.getHttpServer()).get('/lessons').expect(200).expect([]);
  });
});
