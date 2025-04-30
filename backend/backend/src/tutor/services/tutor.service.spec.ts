import { Test, TestingModule } from '@nestjs/testing';
import { TutorService } from './tutor.service';

describe('TutorService', () => {
  let service: TutorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TutorService],
    }).compile();

    service = module.get<TutorService>(TutorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
