import { RecommendationService } from '../../backend/src/recommendation/recommendation.service';
import { LessonsService } from '../../backend/src/lessons/providers/lessons.service';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let mockLessonsService: Partial<LessonsService>;

  beforeEach(() => {
    mockLessonsService = {
      getLessonProgress: jest.fn().mockResolvedValue([
        { courseId: 'course-a', completed: true },
        { courseId: 'course-b', completed: false },
      ]),
    };

    service = new RecommendationService(mockLessonsService as LessonsService);
  });

  it('should recommend course-b if course-a is completed', async () => {
    const recommendations = await service.getNextCourses('test-user-id');
    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ courseId: 'course-b' }),
      ]),
    );
  });
});
