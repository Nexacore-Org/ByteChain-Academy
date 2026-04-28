import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { Progress } from './entities/progress.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { CertificateService } from '../certificates/certificates.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RewardsService } from '../rewards/rewards.service';
import { StreakService } from '../users/streak.service';

const makeProgressRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

const makeLessonRepo = () => ({
  count: jest.fn(),
});

describe('ProgressService', () => {
  let service: ProgressService;
  let progressRepo: ReturnType<typeof makeProgressRepo>;
  let lessonRepo: ReturnType<typeof makeLessonRepo>;
  let certificateService: { issueCertificateForCourse: jest.Mock };
  let notificationsService: { createNotification: jest.Mock };
  let rewardsService: { awardXP: jest.Mock };
  let streakService: { updateStreak: jest.Mock };


  beforeEach(async () => {
    progressRepo = makeProgressRepo();
    lessonRepo = makeLessonRepo();
    certificateService = { issueCertificateForCourse: jest.fn().mockResolvedValue({}) };
    notificationsService = { createNotification: jest.fn().mockResolvedValue(undefined) };
    rewardsService = { awardXP: jest.fn().mockResolvedValue({ xp: 10, newlyAwardedBadges: [] }) };
    streakService = { updateStreak: jest.fn().mockResolvedValue(undefined) };


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: getRepositoryToken(Progress), useValue: progressRepo },
        { provide: getRepositoryToken(Lesson), useValue: lessonRepo },
        { provide: CertificateService, useValue: certificateService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: RewardsService, useValue: rewardsService },
        { provide: StreakService, useValue: streakService },
      ],

    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* -------------------------------------------------------------------------- */
  /*                               completeLesson                               */
  /* -------------------------------------------------------------------------- */

  describe('completeLesson', () => {
    const userId = 'user-uuid-1';
    const courseId = 'course-uuid-1';
    const lessonId = 'lesson-uuid-1';

    it('should create a new progress record and award XP on first completion', async () => {
      progressRepo.findOne
        .mockResolvedValueOnce(null) // alreadyCompleted check
        .mockResolvedValueOnce(null); // existing progress check
      const newProgress = { userId, courseId, lessonId, completed: true, completedAt: new Date() };
      progressRepo.create.mockReturnValue(newProgress);
      progressRepo.save.mockResolvedValue(newProgress);
      lessonRepo.count.mockResolvedValue(5);
      progressRepo.count.mockResolvedValue(1); // not all done yet

      const result = await service.completeLesson(userId, courseId, lessonId);

      expect(progressRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId, courseId, lessonId, completed: true }),
      );
      expect(progressRepo.save).toHaveBeenCalled();
      expect(rewardsService.awardXP).toHaveBeenCalledWith(
        userId,
        10, // XP_LESSON_COMPLETE
        expect.any(String),
      );
      expect(notificationsService.createNotification).toHaveBeenCalled();
      expect(result).toBe(newProgress);
    });

    it('should update existing progress record instead of creating a new one', async () => {
      const existingProgress = {
        userId,
        courseId,
        lessonId,
        completed: false,
        completedAt: null,
        lesson: { order: 1 },
        user: { id: userId },
        course: { id: courseId },
      };
      progressRepo.findOne
        .mockResolvedValueOnce(null) // alreadyCompleted
        .mockResolvedValueOnce(existingProgress); // existing progress record
      progressRepo.save.mockResolvedValue({ ...existingProgress, completed: true });
      lessonRepo.count.mockResolvedValue(5);
      progressRepo.count.mockResolvedValue(1);

      await service.completeLesson(userId, courseId, lessonId);

      expect(progressRepo.create).not.toHaveBeenCalled();
      expect(existingProgress.completed).toBe(true);
      expect(progressRepo.save).toHaveBeenCalledWith(existingProgress);
    });

    it('should NOT award XP when lesson was already completed', async () => {
      const alreadyDone = { id: 'prog-1', completed: true };
      const existingProgress = {
        userId, courseId, lessonId, completed: true, completedAt: new Date(),
        lesson: { order: 1 }, user: { id: userId }, course: { id: courseId },
      };
      progressRepo.findOne
        .mockResolvedValueOnce(alreadyDone) // alreadyCompleted
        .mockResolvedValueOnce(existingProgress);
      progressRepo.save.mockResolvedValue(existingProgress);
      lessonRepo.count.mockResolvedValue(2);
      progressRepo.count.mockResolvedValue(2); // all done → still no XP re-award

      await service.completeLesson(userId, courseId, lessonId);

      expect(rewardsService.awardXP).not.toHaveBeenCalled();
      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('should issue a certificate when all lessons in the course are completed', async () => {
      progressRepo.findOne
        .mockResolvedValueOnce(null) // alreadyCompleted
        .mockResolvedValueOnce(null); // no existing progress
      const newProgress = { userId, courseId, lessonId, completed: true };
      progressRepo.create.mockReturnValue(newProgress);
      progressRepo.save.mockResolvedValue(newProgress);
      lessonRepo.count.mockResolvedValue(3); // 3 total lessons
      progressRepo.count.mockResolvedValue(3); // all 3 completed

      await service.completeLesson(userId, courseId, lessonId);

      expect(certificateService.issueCertificateForCourse).toHaveBeenCalledWith(
        userId,
        courseId,
      );
      // Course completion XP also awarded
      expect(rewardsService.awardXP).toHaveBeenCalledTimes(2);
    });

    it('should NOT issue a certificate when zero lessons exist in the course', async () => {
      progressRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      const newProgress = { userId, courseId, lessonId, completed: true };
      progressRepo.create.mockReturnValue(newProgress);
      progressRepo.save.mockResolvedValue(newProgress);
      lessonRepo.count.mockResolvedValue(0); // edge case: no lessons

      await service.completeLesson(userId, courseId, lessonId);

      expect(certificateService.issueCertificateForCourse).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                             getCourseProgress                              */
  /* -------------------------------------------------------------------------- */

  describe('getCourseProgress', () => {
    it('should return progress records sorted by lesson order', async () => {
      const progressRecords = [
        { lessonId: 'lesson-2', completed: true, completedAt: new Date(), lesson: { order: 2 } },
        { lessonId: 'lesson-1', completed: true, completedAt: new Date(), lesson: { order: 1 } },
        { lessonId: 'lesson-3', completed: false, completedAt: null, lesson: { order: 3 } },
      ];
      progressRepo.find.mockResolvedValue(progressRecords);

      const result = await service.getCourseProgress('user-1', 'course-1');

      expect(progressRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1', courseId: 'course-1' },
        relations: ['lesson'],
      });
      expect(result).toHaveLength(3);
      expect(result[0].lessonId).toBe('lesson-1');
      expect(result[1].lessonId).toBe('lesson-2');
      expect(result[2].lessonId).toBe('lesson-3');
    });

    it('should return an empty array when user has no progress in the course', async () => {
      progressRepo.find.mockResolvedValue([]);

      const result = await service.getCourseProgress('user-1', 'course-1');

      expect(result).toHaveLength(0);
    });

    it('should map each record to { lessonId, completed, completedAt }', async () => {
      const completedAt = new Date('2025-01-15');
      progressRepo.find.mockResolvedValue([
        { lessonId: 'lesson-1', completed: true, completedAt, lesson: { order: 1 } },
      ]);

      const result = await service.getCourseProgress('user-1', 'course-1');

      expect(result[0]).toEqual({
        lessonId: 'lesson-1',
        completed: true,
        completedAt,
      });
    });
  });
});
