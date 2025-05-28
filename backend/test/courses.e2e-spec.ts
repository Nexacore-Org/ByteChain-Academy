import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { CreateCourseDto } from 'src/course/dto/create-course.dto';
import { Course } from 'src/course/entities/course.entity';

describe('CoursesController (e2e)', () => {
  let app: INestApplication;
  let courseRepository: Repository<Course>;
  let courseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    courseRepository = moduleFixture.get<Repository<Course>>(
      getRepositoryToken(Course),
    );

    // Clear the courses table before tests
    await courseRepository.query('DELETE FROM courses');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /courses', () => {
    it('should create a new course', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'E2E Test Course',
        description: 'This is a test course for e2e testing',
        price: 49.99,
        isPublished: false,
        duration: 10.5,
      };

      const response = await request(app.getHttpServer())
        .post('/courses')
        .send(createCourseDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createCourseDto.title);
      expect(response.body.description).toBe(createCourseDto.description);
      expect(response.body.level).toBe(createCourseDto.level);
      expect(Number.parseFloat(response.body.price)).toBe(
        createCourseDto.price,
      );
      expect(response.body.isPublished).toBe(createCourseDto.isPublished);
      expect(response.body.duration).toBe(createCourseDto.duration);

      courseId = response.body.id;
    });

    it('should validate the request body', async () => {
      const invalidDto = {
        // Missing required title
        description: 'Invalid course',
        level: 'invalid-level', // Invalid enum value
        price: -10, // Invalid negative price
      };

      const response = await request(app.getHttpServer())
        .post('/courses')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toContain('title');
      expect(response.body.message).toContain('level');
      expect(response.body.message).toContain('price');
    });
  });

  describe('GET /courses', () => {
    it('should return all courses', async () => {
      const response = await request(app.getHttpServer())
        .get('/courses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
    });
  });

  describe('GET /courses/:id', () => {
    it('should return a course by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/courses/${courseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', courseId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent course', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/courses/${nonExistentId}`)
        .expect(404);
    });

    it('should validate UUID format', async () => {
      const invalidId = 'not-a-uuid';

      await request(app.getHttpServer())
        .get(`/courses/${invalidId}`)
        .expect(400);
    });
  });

  describe('PATCH /courses/:id', () => {
    it('should update a course', async () => {
      const updateDto = {
        title: 'Updated E2E Test Course',
        price: 59.99,
      };

      const response = await request(app.getHttpServer())
        .patch(`/courses/${courseId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', courseId);
      expect(response.body.title).toBe(updateDto.title);
      expect(Number.parseFloat(response.body.price)).toBe(updateDto.price);
    });

    it('should return 404 for non-existent course', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateDto = { title: 'This will fail' };

      await request(app.getHttpServer())
        .patch(`/courses/${nonExistentId}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete a course', async () => {
      await request(app.getHttpServer())
        .delete(`/courses/${courseId}`)
        .expect(204);

      // Verify the course was deleted
      await request(app.getHttpServer())
        .get(`/courses/${courseId}`)
        .expect(404);
    });

    it('should return 404 for non-existent course', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/courses/${nonExistentId}`)
        .expect(404);
    });
  });
});
