/**
 * Critical Journey E2E Test
 *
 * Covers the full happy-path flow:
 *   register → login → (admin) create course → create lesson → create quiz
 *   → (student) enroll → complete lesson → submit quiz → certificate issued
 *
 * The app is bootstrapped exactly once per file with the real AppModule
 * (SQLite file-based DB, same as development). All created records are
 * deleted in afterAll to keep the database clean between runs.
 *
 * Note: global prefix, ValidationPipe, and exception filter are applied
 * in the test setup to match the production bootstrap in main.ts.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { User } from '../src/users/entities/user.entity';
import { Course } from '../src/courses/entities/course.entity';
import { Lesson } from '../src/lessons/entities/lesson.entity';
import { Quiz } from '../src/quizzes/entities/quiz.entity';
import { Question } from '../src/quizzes/entities/question.entity';
import { Progress } from '../src/progress/entities/progress.entity';
import { QuizSubmission } from '../src/quizzes/entities/quiz-submission.entity';
import { Certificate } from '../src/certificates/entities/certificate.entity';
import { UserRole } from '../src/users/entities/user.entity';

const PREFIX = '/api/v1';

describe('Critical User Journey (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  // IDs collected during the journey — used for assertions and cleanup
  let adminId: string;
  let studentId: string;
  let adminToken: string;
  let studentToken: string;
  let courseId: string;
  let lessonId: string;
  let quizId: string;
  let questionId: string;

  // Unique e-mail suffixes so parallel CI runs don't collide
  const run = Date.now();
  const adminEmail = `admin-journey-${run}@example.com`;
  const studentEmail = `student-journey-${run}@example.com`;
  const password = 'Journey@123';

  /* ---------------------------------------------------------------------- */
  /*  Bootstrap                                                               */
  /* ---------------------------------------------------------------------- */

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror the production bootstrap
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  }, 30_000);

  afterAll(async () => {
    // Delete in dependency order to respect FK constraints
    if (dataSource) {
      await dataSource
        .getRepository(Certificate)
        .delete({ user: { id: studentId } });
      await dataSource
        .getRepository(QuizSubmission)
        .delete({ userId: studentId });
      await dataSource.getRepository(Progress).delete({ userId: studentId });
      if (quizId) {
        await dataSource.getRepository(Question).delete({ quizId });
        await dataSource.getRepository(Quiz).delete({ id: quizId });
      }
      if (lessonId)
        await dataSource.getRepository(Lesson).delete({ id: lessonId });
      if (courseId)
        await dataSource.getRepository(Course).delete({ id: courseId });
      if (studentId)
        await dataSource.getRepository(User).delete({ id: studentId });
      if (adminId) await dataSource.getRepository(User).delete({ id: adminId });
    }
    await app.close();
  }, 15_000);

  /* ---------------------------------------------------------------------- */
  /*  Step 1 – Register admin user                                           */
  /* ---------------------------------------------------------------------- */

  it('1. registers an admin user', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/auth/register`)
      .send({ email: adminEmail, password, name: 'Journey Admin' })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(adminEmail);

    adminId = res.body.user.id;
    adminToken = res.body.token;

    // Promote to admin directly in the DB
    await dataSource
      .getRepository(User)
      .update(adminId, { role: UserRole.ADMIN });
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 2 – Login as admin to get a fresh token with admin role           */
  /* ---------------------------------------------------------------------- */

  it('2. logs in as admin and receives a JWT with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/auth/login`)
      .send({ email: adminEmail, password })
      .expect(200);

    expect(res.body.token).toBeDefined();
    adminToken = res.body.token; // refresh token so role claim is correct
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 3 – Admin creates a published course                              */
  /* ---------------------------------------------------------------------- */

  it('3. admin creates a published course', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/courses`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'E2E Journey Course',
        description: 'Created by the critical-journey test',
        published: true,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('E2E Journey Course');
    courseId = res.body.id;
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 4 – Admin creates a lesson in the course                          */
  /* ---------------------------------------------------------------------- */

  it('4. admin creates a lesson inside the course', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/lessons`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Lesson 1 – Introduction',
        content: 'Welcome to the journey.',
        order: 1,
        courseId,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.courseId).toBe(courseId);
    lessonId = res.body.id;
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 5 – Admin creates a quiz for that lesson                          */
  /* ---------------------------------------------------------------------- */

  it('5. admin creates a quiz attached to the lesson', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/quizzes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Journey Quiz',
        description: 'Test your knowledge',
        lessonId,
        questions: [
          {
            text: 'What is 2 + 2?',
            type: 'multiple_choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
          },
        ],
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    quizId = res.body.id;
    expect(res.body.questions).toHaveLength(1);
    questionId = res.body.questions[0].id;
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 6 – Register a student                                            */
  /* ---------------------------------------------------------------------- */

  it('6. registers a student user', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/auth/register`)
      .send({ email: studentEmail, password, name: 'Journey Student' })
      .expect(201);

    expect(res.body.token).toBeDefined();
    studentId = res.body.user.id;
    studentToken = res.body.token;
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 7 – Student enrolls in the course                                 */
  /* ---------------------------------------------------------------------- */

  it('7. student enrolls in the course', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(201);

    expect(res.body.message).toMatch(/enrolled/i);
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 8 – Student completes the lesson                                  */
  /* ---------------------------------------------------------------------- */

  it('8. student marks the lesson as complete', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/progress/lesson`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId, lessonId })
      .expect(201);

    expect(res.body.completed).toBe(true);
    expect(res.body.lessonId).toBe(lessonId);
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 9 – Student submits the quiz and passes                           */
  /* ---------------------------------------------------------------------- */

  it('9. student submits the quiz with the correct answer and passes', async () => {
    const res = await request(app.getHttpServer())
      .post(`${PREFIX}/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: { [questionId]: '4' } })
      .expect(201);

    expect(res.body.passed).toBe(true);
    expect(res.body.score).toBe(100);
    expect(res.body.correctAnswers).toBe(1);
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 10 – Certificate is automatically issued                          */
  /* ---------------------------------------------------------------------- */

  it('10. a certificate is automatically issued after course completion', async () => {
    const res = await request(app.getHttpServer())
      .get(`${PREFIX}/certificates/my`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const cert = res.body[0];
    expect(cert.certificateHash).toBeDefined();
    expect(cert.isValid).toBe(true);
    expect(cert.recipientEmail).toBe(studentEmail);
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 11 – Certificate is publicly verifiable by hash                  */
  /* ---------------------------------------------------------------------- */

  it('11. the issued certificate can be publicly verified by its hash', async () => {
    // Fetch the cert hash first
    const listRes = await request(app.getHttpServer())
      .get(`${PREFIX}/certificates/my`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    const certHash = listRes.body[0]?.certificateHash;
    expect(certHash).toBeDefined();

    const verifyRes = await request(app.getHttpServer())
      .post(`${PREFIX}/certificates/verify`)
      .send({ certificateHash: certHash })
      .expect(201);

    expect(verifyRes.body.isValid).toBe(true);
    expect(verifyRes.body.certificate.recipientEmail).toBe(studentEmail);
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 12 – Duplicate quiz submission is rejected                        */
  /* ---------------------------------------------------------------------- */

  it('12. submitting the same quiz twice returns 409 Conflict', async () => {
    await request(app.getHttpServer())
      .post(`${PREFIX}/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: { [questionId]: '4' } })
      .expect(409);
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 13 – Unauthenticated access is rejected                           */
  /* ---------------------------------------------------------------------- */

  it('13. accessing a protected endpoint without a token returns 401', async () => {
    await request(app.getHttpServer())
      .get(`${PREFIX}/certificates/my`)
      .expect(401);
  });

  /* ---------------------------------------------------------------------- */
  /*  Step 14 – Student cannot access admin endpoints                        */
  /* ---------------------------------------------------------------------- */

  it('14. student cannot create a course (admin-only endpoint returns 403)', async () => {
    await request(app.getHttpServer())
      .post(`${PREFIX}/courses`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hack', description: 'Not allowed' })
      .expect(403);
  });
});
