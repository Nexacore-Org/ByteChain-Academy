import { Test, TestingModule } from '@nestjs/testing';
import { LessonQuizResultsService } from './lesson-quiz-results.service';

describe('LessonQuizResultsService', () => {
  let service: LessonQuizResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonQuizResultsService],
    }).compile();

    service = module.get<LessonQuizResultsService>(LessonQuizResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
