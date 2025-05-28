import { Test, TestingModule } from '@nestjs/testing';
import { ProgressTrackingService } from './progress.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { Repository } from 'typeorm';

describe('ProgressTrackingService', () => {
  let service: ProgressTrackingService;
  let progressRepository: Repository<Progress>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressTrackingService,
        {
          provide: getRepositoryToken(Progress),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProgressTrackingService>(ProgressTrackingService);
    progressRepository = module.get<Repository<Progress>>(
      getRepositoryToken(Progress),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate course completion', async () => {
    const studentId = 1;
    const courseId = 1;
    const progress = new Progress();
    progress.completedLessons = 5;
    progress.completedQuizzes = 3;
    jest.spyOn(progressRepository, 'findOne').mockResolvedValue(progress);

    const completion = await service.calculateCourseCompletion(
      studentId,
      courseId,
    );
    expect(completion).toBeGreaterThanOrEqual(0);
    expect(completion).toBeLessThanOrEqual(100);
  });
});
