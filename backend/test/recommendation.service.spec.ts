import { RecommendationService } from '../recommendation.service';

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = new RecommendationService();
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
