import { Test, TestingModule } from '@nestjs/testing';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('LessonsController', () => {
  let controller: LessonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        { provide: LessonsService, useValue: { create: jest.fn(), findAllByCourse: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() } },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Auth Guards', () => {
    it('should apply JwtAuthGuard and RolesGuard on create', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LessonsController.prototype.create,
      );
      expect(guards).toBeDefined();
      expect(guards).toEqual(
        expect.arrayContaining([JwtAuthGuard, RolesGuard]),
      );
    });

    it('should apply JwtAuthGuard and RolesGuard on update', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LessonsController.prototype.update,
      );
      expect(guards).toBeDefined();
      expect(guards).toEqual(
        expect.arrayContaining([JwtAuthGuard, RolesGuard]),
      );
    });

    it('should apply JwtAuthGuard and RolesGuard on remove', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LessonsController.prototype.remove,
      );
      expect(guards).toBeDefined();
      expect(guards).toEqual(
        expect.arrayContaining([JwtAuthGuard, RolesGuard]),
      );
    });

    it('should not apply auth guards on findByCourse', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LessonsController.prototype.findByCourse,
      );
      expect(guards).toBeUndefined();
    });

    it('should not apply auth guards on findOne', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LessonsController.prototype.findOne,
      );
      expect(guards).toBeUndefined();
    });
  });
});
