import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let lessonAnalyticsRepo: any;
  let quizAnalyticsRepo: any;

  beforeEach(() => {
    lessonAnalyticsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    quizAnalyticsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    service = new AnalyticsService(lessonAnalyticsRepo, quizAnalyticsRepo);
  });

  it('should calculate lesson duration correctly', async () => {
    const now = new Date();
    const start = new Date(now.getTime() - 5000);
    lessonAnalyticsRepo.findOne.mockResolvedValue({
      userId: 1,
      lessonId: 2,
      lessonStartTime: start,
      lessonEndTime: null,
      durationSeconds: null,
    });
    lessonAnalyticsRepo.save.mockImplementation(async (record) => record);
    const result = await service.endLesson(1, 2);
    expect(result.durationSeconds).toBeCloseTo(5, 0);
  });

  it('should record quiz score', async () => {
    quizAnalyticsRepo.create.mockReturnValue({
      userId: 1,
      lessonId: 2,
      quizId: 3,
      score: 90,
      attempt: 1,
    });
    quizAnalyticsRepo.save.mockImplementation(async (record) => record);
    const result = await service.recordQuizScore(1, 2, 3, 90, 1);
    expect(result.score).toBe(90);
    expect(result.attempt).toBe(1);
  });
});
