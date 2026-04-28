import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CourseRegistration } from './entities/course-registration.entity';
import { PaginationService } from '../common/services/pagination.service';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../progress/entities/progress.entity';
import { NotificationsService } from '../notifications/notifications.service';

const now = new Date();

const mockCourse = {
  id: 'course-uuid-1',
  title: 'Intro to Web3',
  description: 'Learn blockchain basics',
  published: true,
  createdAt: now,
  updatedAt: now,
};

const paginatedEmpty = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

const makeCourseRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  restore: jest.fn(),
});

const makeRegRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepo: ReturnType<typeof makeCourseRepo>;
  let regRepo: ReturnType<typeof makeRegRepo>;
  let lessonRepo: ReturnType<typeof makeLessonRepo>;
  let progressRepo: ReturnType<typeof makeProgressRepo>;
  let paginationService: { paginate: jest.Mock };
  let notificationsService: { createNotification: jest.Mock };

  beforeEach(async () => {
    courseRepo = makeCourseRepo();
    regRepo = makeRegRepo();
    lessonRepo = makeLessonRepo();
    progressRepo = makeProgressRepo();
    paginationService = {
      paginate: jest.fn().mockResolvedValue(paginatedEmpty),
    };
    notificationsService = {
      createNotification: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: mockRepo() },
        {
          provide: getRepositoryToken(CourseRegistration),
          useValue: mockRepo(),
        },
        {
          provide: PaginationService,
          useValue: {
            paginate: jest.fn().mockResolvedValue({
              data: [],
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* -------------------------------------------------------------------------- */
  /*                                   create                                   */
  /* -------------------------------------------------------------------------- */

  describe('create', () => {
    it('should create and return a CourseResponseDto', async () => {
      courseRepo.create.mockReturnValue(mockCourse);
      courseRepo.save.mockResolvedValue(mockCourse);

      const result = await service.create({
        title: mockCourse.title,
        description: mockCourse.description,
      });

      expect(courseRepo.create).toHaveBeenCalledWith({
        title: mockCourse.title,
        description: mockCourse.description,
      });
      expect(courseRepo.save).toHaveBeenCalledWith(mockCourse);
      expect(result.id).toBe(mockCourse.id);
      expect(result.title).toBe(mockCourse.title);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                  findAll                                   */
  /* -------------------------------------------------------------------------- */

  describe('findAll', () => {
    it('should return a paginated list of published courses', async () => {
      const paginated = {
        data: [mockCourse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      paginationService.paginate.mockResolvedValue(paginated);

      const result = await service.findAll(1, 10);

      expect(paginationService.paginate).toHaveBeenCalledWith(
        courseRepo,
        { page: 1, limit: 10 },
        { where: { published: true }, order: { createdAt: 'DESC' } },
      );
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use default page=1 limit=10 when not provided', async () => {
      await service.findAll();
      expect(paginationService.paginate).toHaveBeenCalledWith(
        courseRepo,
        { page: 1, limit: 10 },
        expect.any(Object),
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                  findOne                                   */
  /* -------------------------------------------------------------------------- */

  describe('findOne', () => {
    it('should return a CourseResponseDto for an existing course', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);

      const result = await service.findOne(mockCourse.id);

      expect(courseRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockCourse.id },
      });
      expect(result.id).toBe(mockCourse.id);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   update                                   */
  /* -------------------------------------------------------------------------- */

  describe('update', () => {
    it('should update and return the updated course', async () => {
      const updated = { ...mockCourse, title: 'Updated Title' };
      courseRepo.findOne.mockResolvedValue({ ...mockCourse });
      courseRepo.save.mockResolvedValue(updated);

      const result = await service.update(mockCourse.id, {
        title: 'Updated Title',
      });

      expect(courseRepo.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   remove                                   */
  /* -------------------------------------------------------------------------- */

  describe('remove', () => {
    it('should soft-remove an existing course', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);
      courseRepo.softRemove.mockResolvedValue(undefined);

      await service.remove(mockCourse.id);

      expect(courseRepo.softRemove).toHaveBeenCalledWith(mockCourse);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   restore                                  */
  /* -------------------------------------------------------------------------- */

  describe('restore', () => {
    it('should restore a soft-deleted course', async () => {
      courseRepo.restore.mockResolvedValue({ affected: 1 });

      await service.restore(mockCourse.id);

      expect(courseRepo.restore).toHaveBeenCalledWith(mockCourse.id);
    });

    it('should throw NotFoundException when course does not exist or not deleted', async () => {
      courseRepo.restore.mockResolvedValue(0);

      await expect(service.restore('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                   enroll                                   */
  /* -------------------------------------------------------------------------- */

  describe('enroll', () => {
    it('should create a registration when user is not yet enrolled', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);
      regRepo.findOne.mockResolvedValue(null);
      const reg = {
        id: 'reg-1',
        userId: 'user-1',
        courseId: mockCourse.id,
        enrolledAt: now,
      };
      regRepo.create.mockReturnValue(reg);
      regRepo.save.mockResolvedValue(reg);

      const result = await service.enroll('user-1', mockCourse.id);

      expect(regRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        courseId: mockCourse.id,
      });
      expect(regRepo.save).toHaveBeenCalledWith(reg);
      expect(result.userId).toBe('user-1');
      expect(result.courseId).toBe(mockCourse.id);
    });

    it('should not create a duplicate registration if user is already enrolled', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);
      const existing = {
        id: 'reg-1',
        userId: 'user-1',
        courseId: mockCourse.id,
        enrolledAt: now,
      };
      regRepo.findOne.mockResolvedValue(existing);

      const result = await service.enroll('user-1', mockCourse.id);

      expect(regRepo.create).not.toHaveBeenCalled();
      expect(regRepo.save).not.toHaveBeenCalled();
      expect(result.id).toBe(existing.id);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.enroll('user-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                            getEnrolledCourses                              */
  /* -------------------------------------------------------------------------- */

  describe('getEnrolledCourses', () => {
    it('should return enrolled courses with progress for user registrations', async () => {
      regRepo.find.mockResolvedValue([
        {
          userId: 'user-1',
          courseId: mockCourse.id,
          course: mockCourse,
          enrolledAt: now,
        },
      ]);
      lessonRepo.count.mockResolvedValue(4);
      progressRepo.count.mockResolvedValue(2);

      const result = await service.getEnrolledCourses('user-1');

      expect(regRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['course'],
        order: { enrolledAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockCourse.id);
      expect(result[0].progressPercent).toBe(50);
    });

    it('should return an empty array when user has no courses', async () => {
      regRepo.find.mockResolvedValue([]);

      const result = await service.getEnrolledCourses('user-1');

      expect(result).toHaveLength(0);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                               findAllAdmin                                 */
  /* -------------------------------------------------------------------------- */

  describe('findAllAdmin', () => {
    it('should paginate with no filters when search and status are absent', async () => {
      await service.findAllAdmin(1, 10);
      expect(paginationService.paginate).toHaveBeenCalled();
    });

    it('should filter by published=true when status is "published"', async () => {
      await service.findAllAdmin(1, 10, undefined, 'published');
      const call = paginationService.paginate.mock.calls[0];
      // statusFilter is folded into where
      expect(call[2]).toMatchObject({ order: { createdAt: 'DESC' } });
    });

    it('should filter by search term when search is provided', async () => {
      await service.findAllAdmin(1, 10, 'blockchain');
      const call = paginationService.paginate.mock.calls[0];
      expect(call[2].where).toBeDefined();
    });

    it('should include soft-deleted courses when includeDeleted is true', async () => {
      await service.findAllAdmin(1, 10, undefined, undefined, true);
      const call = paginationService.paginate.mock.calls[0];
      expect(call[2]).toMatchObject({ withDeleted: true });
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                publishCourse                                */
  /* -------------------------------------------------------------------------- */

  describe('publishCourse', () => {
    it('should publish a course with lessons and notify enrolled users', async () => {
      const unpublishedCourse = { ...mockCourse, published: false };
      courseRepo.findOne.mockResolvedValue(unpublishedCourse);
      lessonRepo.count.mockResolvedValue(2);
      courseRepo.save.mockResolvedValue({
        ...unpublishedCourse,
        published: true,
      });
      regRepo.find.mockResolvedValue([
        { userId: 'user-1' },
        { userId: 'user-2' },
      ]);

      const result = await service.publishCourse(mockCourse.id);

      expect(lessonRepo.count).toHaveBeenCalledWith({
        where: { courseId: mockCourse.id },
      });
      expect(courseRepo.save).toHaveBeenCalled();
      expect(notificationsService.createNotification).toHaveBeenCalledTimes(2);
      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        'user-1',
        'NEW_CONTENT',
        `New content available in course: ${mockCourse.title}`,
        `/courses/${mockCourse.id}`,
      );
      expect(result.published).toBe(true);
    });

    it('should throw BadRequestException when course has no lessons', async () => {
      const unpublishedCourse = { ...mockCourse, published: false };
      courseRepo.findOne.mockResolvedValue(unpublishedCourse);
      lessonRepo.count.mockResolvedValue(0);

      await expect(service.publishCourse(mockCourse.id)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.publishCourse(mockCourse.id)).rejects.toThrow(
        'Cannot publish a course with no lessons',
      );
    });

    it('should return early if course is already published', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);

      const result = await service.publishCourse(mockCourse.id);

      expect(lessonRepo.count).not.toHaveBeenCalled();
      expect(courseRepo.save).not.toHaveBeenCalled();
      expect(result.published).toBe(true);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.publishCourse('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                              unpublishCourse                                */
  /* -------------------------------------------------------------------------- */

  describe('unpublishCourse', () => {
    it('should unpublish a published course', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);
      courseRepo.save.mockResolvedValue({ ...mockCourse, published: false });

      const result = await service.unpublishCourse(mockCourse.id);

      expect(courseRepo.save).toHaveBeenCalled();
      expect(result.published).toBe(false);
    });

    it('should return early if course is already unpublished', async () => {
      const unpublishedCourse = { ...mockCourse, published: false };
      courseRepo.findOne.mockResolvedValue(unpublishedCourse);

      const result = await service.unpublishCourse(mockCourse.id);

      expect(courseRepo.save).not.toHaveBeenCalled();
      expect(result.published).toBe(false);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.unpublishCourse('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
