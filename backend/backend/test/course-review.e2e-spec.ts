import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreateCourseReviewDto } from '../src/courses/dto/create-course-review.dto';
import { UserRole } from '../src/roles/roles.enum';

describe('CourseReview (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let courseId: string;
  let reviewId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            autoLoadEntities: true,
            synchronize: true,
          }),
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a test student and get auth token
    const studentResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Student',
        role: UserRole.STUDENT,
      });

    authToken = studentResponse.body.access_token;

    // Create a test course
    const courseResponse = await request(app.getHttpServer())
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Course',
        description: 'Test Description',
        duration: '2 hours',
      });

    courseId = courseResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/course-reviews (POST)', () => {
    it('should create a course review', async () => {
      const createReviewDto: CreateCourseReviewDto = {
        rating: 4,
        comment: 'Great course!',
        courseId: courseId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/course-reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createReviewDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.rating).toBe(createReviewDto.rating);
      expect(response.body.comment).toBe(createReviewDto.comment);

      reviewId = response.body.id;
    });

    it('should not allow duplicate reviews from the same student', async () => {
      const createReviewDto: CreateCourseReviewDto = {
        rating: 5,
        comment: 'Another review',
        courseId: courseId,
      };

      await request(app.getHttpServer())
        .post('/api/v1/course-reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createReviewDto)
        .expect(403);
    });
  });

  describe('/api/v1/course-reviews/course/:courseId (GET)', () => {
    it('should get all reviews for a course', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/course-reviews/course/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/api/v1/course-reviews/:id (PATCH)', () => {
    it('should update a review', async () => {
      const updateDto = {
        rating: 5,
        comment: 'Updated comment',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/course-reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.rating).toBe(updateDto.rating);
      expect(response.body.comment).toBe(updateDto.comment);
    });
  });

  describe('/api/v1/course-reviews/:id (DELETE)', () => {
    it('should delete a review', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/course-reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify the review is deleted
      await request(app.getHttpServer())
        .get(`/api/v1/course-reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
