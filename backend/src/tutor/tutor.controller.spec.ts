import { Test, TestingModule } from '@nestjs/testing';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';

describe('TutorController', () => {
  let controller: TutorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorController],
      providers: [TutorService],
    }).compile();

    controller = module.get<TutorController>(TutorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
