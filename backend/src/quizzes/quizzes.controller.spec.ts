import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('QuizzesController', () => {
  let controller: QuizzesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [
        { provide: QuizzesService, useValue: { create: jest.fn(), findByLessonId: jest.fn(), update: jest.fn(), findOne: jest.fn(), submitQuiz: jest.fn(), getUserSubmission: jest.fn(), getUserSubmissions: jest.fn() } },
      ],
    }).compile();

    controller = module.get<QuizzesController>(QuizzesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Auth Guards', () => {
    it('should apply JwtAuthGuard and RolesGuard on create', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        QuizzesController.prototype.create,
      );
      expect(guards).toBeDefined();
      expect(guards).toEqual(
        expect.arrayContaining([JwtAuthGuard, RolesGuard]),
      );
    });

    it('should apply JwtAuthGuard and RolesGuard on update', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        QuizzesController.prototype.update,
      );
      expect(guards).toBeDefined();
      expect(guards).toEqual(
        expect.arrayContaining([JwtAuthGuard, RolesGuard]),
      );
    });

    it('should apply JwtAuthGuard and RolesGuard on findOne (admin)', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        QuizzesController.prototype.findOne,
      );
      expect(guards).toBeDefined();
      expect(guards).toEqual(
        expect.arrayContaining([JwtAuthGuard, RolesGuard]),
      );
    });

    it('should apply JwtAuthGuard on findByLesson', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        QuizzesController.prototype.findByLesson,
      );
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should apply JwtAuthGuard on submitQuiz', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        QuizzesController.prototype.submitQuiz,
      );
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should apply JwtAuthGuard on getMySubmissions', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        QuizzesController.prototype.getMySubmissions,
      );
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should apply JwtAuthGuard on getUserSubmission', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        QuizzesController.prototype.getUserSubmission,
      );
      expect(guards).toBeDefined();
      expect(guards).toContain(JwtAuthGuard);
    });
  });
});
