import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            startLesson: jest.fn(),
            endLesson: jest.fn(),
            recordQuizScore: jest.fn(),
            getUserAnalytics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should call startLesson with user and lessonId', async () => {
    const req = { user: { id: 1 } };
    const dto = { lessonId: 2 };
    await controller.lessonStart(req as any, dto);
    expect(service.startLesson).toHaveBeenCalledWith(1, 2);
  });

  it('should call endLesson with user and lessonId', async () => {
    const req = { user: { id: 1 } };
    const dto = { lessonId: 2 };
    await controller.lessonEnd(req as any, dto);
    expect(service.endLesson).toHaveBeenCalledWith(1, 2);
  });

  it('should call recordQuizScore with correct params', async () => {
    const req = { user: { id: 1 } };
    const dto = { lessonId: 2, quizId: 3, score: 80, attempt: 1 };
    await controller.quizScore(req as any, dto);
    expect(service.recordQuizScore).toHaveBeenCalledWith(1, 2, 3, 80, 1);
  });

  it('should call getUserAnalytics with userId', async () => {
    await controller.getUserAnalytics(1);
    expect(service.getUserAnalytics).toHaveBeenCalledWith(1);
  });
});
