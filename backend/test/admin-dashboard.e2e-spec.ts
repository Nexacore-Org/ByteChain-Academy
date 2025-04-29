import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Admin } from '../src/admin/entities/admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

describe('AdminDashboardController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;

  const mockAdmin = {
    id: '1',
    email: 'admin@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([Admin])],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Generate admin token
    adminToken = jwtService.sign({
      sub: mockAdmin.id,
      email: mockAdmin.email,
      roles: [mockAdmin.role],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/dashboard (POST)', () => {
    it('should create a new admin', () => {
      const createAdminDto = {
        email: 'newadmin@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Admin',
      };

      return request(app.getHttpServer())
        .post('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createAdminDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(createAdminDto.email);
          expect(res.body.firstName).toBe(createAdminDto.firstName);
          expect(res.body.lastName).toBe(createAdminDto.lastName);
        });
    });
  });

  describe('/admin/dashboard/:id (PATCH)', () => {
    it('should update an admin', () => {
      const updateAdminDto = {
        firstName: 'Updated',
        lastName: 'Admin',
      };

      return request(app.getHttpServer())
        .patch('/admin/dashboard/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateAdminDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toBe(updateAdminDto.firstName);
          expect(res.body.lastName).toBe(updateAdminDto.lastName);
        });
    });
  });

  describe('/admin/dashboard/courses/statistics (GET)', () => {
    it('should return course statistics', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard/courses/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCourses');
          expect(res.body).toHaveProperty('activeCourses');
          expect(res.body).toHaveProperty('enrolledStudents');
        });
    });
  });

  describe('/admin/dashboard/users/statistics (GET)', () => {
    it('should return user statistics', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard/users/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalUsers');
          expect(res.body).toHaveProperty('activeUsers');
          expect(res.body).toHaveProperty('newUsersThisMonth');
        });
    });
  });

  describe('/admin/dashboard/payments/statistics (GET)', () => {
    it('should return payment statistics', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard/payments/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalRevenue');
          expect(res.body).toHaveProperty('monthlyRevenue');
          expect(res.body).toHaveProperty('pendingPayments');
        });
    });
  });

  describe('/admin/dashboard/payments/transactions (GET)', () => {
    it('should return recent transactions with default limit', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard/payments/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return recent transactions with custom limit', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard/payments/transactions?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Authorization', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard/courses/statistics')
        .expect(401);
    });

    it('should return 403 with non-admin token', () => {
      const nonAdminToken = jwtService.sign({
        sub: '2',
        email: 'user@example.com',
        roles: ['USER'],
      });

      return request(app.getHttpServer())
        .get('/admin/dashboard/courses/statistics')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .expect(403);
    });
  });
});
