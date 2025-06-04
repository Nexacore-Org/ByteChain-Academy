import { AnalyticsService } from './analytics.service';

describe('AnalyticsService Performance', () => {
  let service: AnalyticsService;
  let lessonAnalyticsRepo: any;
  let quizAnalyticsRepo: any;

  beforeEach(() => {
    lessonAnalyticsRepo = {
      find: jest.fn(),
    };
    quizAnalyticsRepo = {
      find: jest.fn(),
    };
    service = new AnalyticsService(lessonAnalyticsRepo, quizAnalyticsRepo);
  });

  it('should efficiently fetch analytics for many lessons', async () => {
    const lessons = Array.from({ length: 1000 }, (_, i) => ({ userId: 1, lessonId: i, lessonStartTime: new Date(), lessonEndTime: new Date(), durationSeconds: 100 }));
    const quizzes = Array.from({ length: 1000 }, (_, i) => ({ userId: 1, lessonId: i, quizId: i, score: 80, attempt: 1 }));
    lessonAnalyticsRepo.find.mockResolvedValue(lessons);
    quizAnalyticsRepo.find.mockResolvedValue(quizzes);
    const start = Date.now();
    const result = await service.getUserAnalytics(1);
    const duration = Date.now() - start;
    expect(result.lessons.length).toBe(1000);
    expect(result.quizzes.length).toBe(1000);
    expect(duration).toBeLessThan(500); // Should be fast
  });
});
