import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Course } from '../src/entities/course.entity';
import { Lesson } from '../src/entities/lesson.entity';

describe('LessonsController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;
  let courseId: string;
  let lessonId: string;

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
  });

  afterAll(async () => {
    // Clean up test data
    if (dataSource) {
      const lessonRepo = dataSource.getRepository(Lesson);
      const courseRepo = dataSource.getRepository(Course);
      const userRepo = dataSource.getRepository(User);

      await lessonRepo.delete({ courseId });
      await courseRepo.delete({ id: courseId });
      await userRepo.delete({ id: userId });
    }
    await app.close();
  });

  describe('POST /lessons', () => {
    it('should create a lesson with all fields (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lesson',
          content: 'Test lesson content',
          videoUrl: 'https://example.com/video.mp4',
          videoStartTimestamp: 30,
          order: 1,
          courseId: courseId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Lesson');
      expect(response.body.content).toBe('Test lesson content');
      expect(response.body.videoUrl).toBe('https://example.com/video.mp4');
      expect(response.body.videoStartTimestamp).toBe(30);
      expect(response.body.order).toBe(1);
      expect(response.body.courseId).toBe(courseId);

      lessonId = response.body.id;
    });

    it('should create a lesson without optional video fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Lesson Without Video',
          content: 'Content without video',
          courseId: courseId,
        })
        .expect(201);

      expect(response.body.videoUrl).toBeNull();
      expect(response.body.videoStartTimestamp).toBeNull();
    });

    it('should reject creation without authentication', async () => {
      await request(app.getHttpServer())
        .post('/lessons')
        .send({
          title: 'Test Lesson',
          content: 'Test content',
          courseId: courseId,
        })
        .expect(401);
    });

    it('should reject creation with invalid course ID', async () => {
      await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lesson',
          content: 'Test content',
          courseId: 'non-existent-course-id',
        })
        .expect(404);
    });

    it('should reject creation with invalid video URL', async () => {
      await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lesson',
          content: 'Test content',
          videoUrl: 'not-a-valid-url',
          courseId: courseId,
        })
        .expect(400);
    });

    it('should reject creation with negative video start timestamp', async () => {
      await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lesson',
          content: 'Test content',
          videoUrl: 'https://example.com/video.mp4',
          videoStartTimestamp: -1,
          courseId: courseId,
        })
        .expect(400);
    });
  });

  describe('GET /lessons/course/:courseId', () => {
    it('should return all lessons for a course (public endpoint)', async () => {
      // Create additional lessons
      await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Lesson 2',
          content: 'Content 2',
          order: 2,
          courseId: courseId,
        });

      await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Lesson 3',
          content: 'Content 3',
          order: 3,
          courseId: courseId,
        });

      const response = await request(app.getHttpServer())
        .get(`/lessons/course/${courseId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      // Should be ordered by order ASC
      expect(response.body[0].order).toBeLessThanOrEqual(response.body[1].order);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('courseId', courseId);
    });

    it('should return empty array for course with no lessons', async () => {
      // Create a new course
      const newCourseResponse = await request(app.getHttpServer())
        .post('/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Empty Course',
          description: 'Course with no lessons',
        });

      const newCourseId = newCourseResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/lessons/course/${newCourseId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      // Cleanup
      await dataSource.getRepository(Course).delete({ id: newCourseId });
    });

    it('should return 404 for non-existent course', async () => {
      await request(app.getHttpServer())
        .get('/lessons/course/non-existent-course-id')
        .expect(404);
    });
  });

  describe('GET /lessons/:id', () => {
    it('should return a single lesson (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/lessons/${lessonId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', lessonId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('courseId', courseId);
    });

    it('should return 404 for non-existent lesson', async () => {
      await request(app.getHttpServer())
        .get('/lessons/non-existent-lesson-id')
        .expect(404);
    });
  });

  describe('PATCH /lessons/:id', () => {
    it('should update lesson (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/lessons/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Lesson Title',
          videoUrl: 'https://example.com/updated-video.mp4',
          videoStartTimestamp: 60,
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Lesson Title');
      expect(response.body.videoUrl).toBe('https://example.com/updated-video.mp4');
      expect(response.body.videoStartTimestamp).toBe(60);
    });

    it('should update only provided fields', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/lessons/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Partially Updated Title',
        })
        .expect(200);

      expect(response.body.title).toBe('Partially Updated Title');
      // Other fields should remain unchanged
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('courseId', courseId);
    });

    it('should reject update without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/lessons/${lessonId}`)
        .send({
          title: 'Updated Title',
        })
        .expect(401);
    });

    it('should return 404 for non-existent lesson', async () => {
      await request(app.getHttpServer())
        .patch('/lessons/non-existent-lesson-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(404);
    });
  });

  describe('DELETE /lessons/:id', () => {
    it('should delete lesson (admin only)', async () => {
      // Create a lesson to delete
      const createResponse = await request(app.getHttpServer())
        .post('/lessons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Lesson to Delete',
          content: 'Content',
          courseId: courseId,
        });

      const deleteLessonId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/lessons/${deleteLessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/lessons/${deleteLessonId}`)
        .expect(404);
    });

    it('should reject deletion without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/lessons/${lessonId}`)
        .expect(401);
    });

    it('should return 404 for non-existent lesson', async () => {
      await request(app.getHttpServer())
        .delete('/lessons/non-existent-lesson-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
