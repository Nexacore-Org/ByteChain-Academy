import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CourseRegistration } from './entities/course-registration.entity';
import { PaginationService } from 'src/common/services/pagination.service';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Progress } from 'src/progress/entities/progress.entity';

const now = new Date();

const mockCourse = {
  id: 'course-uuid-1',
  title: 'Intro to Web3',
  description: 'Learn blockchain basics',
  published: true,
  createdAt: now,
  updatedAt: now,
};

const paginatedEmpty = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };

const makeCourseRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
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
  let paginationService: { paginate: jest.Mock };

  beforeEach(async () => {
    courseRepo = makeCourseRepo();
    regRepo = makeRegRepo();
    paginationService = {
      paginate: jest.fn().mockResolvedValue(paginatedEmpty),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: courseRepo },
        { provide: getRepositoryToken(CourseRegistration), useValue: regRepo },
        { provide: PaginationService, useValue: paginationService },
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
    it('should remove an existing course', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);
      courseRepo.remove.mockResolvedValue(undefined);

      await service.remove(mockCourse.id);

      expect(courseRepo.remove).toHaveBeenCalledWith(mockCourse);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                                 enrollUser                                 */
  /* -------------------------------------------------------------------------- */

  describe('enrollUser', () => {
    it('should create a registration when user is not yet enrolled', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);
      regRepo.findOne.mockResolvedValue(null);
      const reg = { userId: 'user-1', courseId: mockCourse.id };
      regRepo.create.mockReturnValue(reg);
      regRepo.save.mockResolvedValue(reg);

      await service.enrollUser('user-1', mockCourse.id);

      expect(regRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        courseId: mockCourse.id,
      });
      expect(regRepo.save).toHaveBeenCalledWith(reg);
    });

    it('should not create a duplicate registration if user is already enrolled', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);
      regRepo.findOne.mockResolvedValue({ userId: 'user-1', courseId: mockCourse.id });

      await service.enrollUser('user-1', mockCourse.id);

      expect(regRepo.create).not.toHaveBeenCalled();
      expect(regRepo.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when course does not exist', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(
        service.enrollUser('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                              findUserCourses                               */
  /* -------------------------------------------------------------------------- */

  describe('findUserCourses', () => {
    it('should return mapped CourseResponseDtos for user registrations', async () => {
      regRepo.find.mockResolvedValue([
        { userId: 'user-1', courseId: mockCourse.id, course: mockCourse },
      ]);

      const result = await service.findUserCourses('user-1');

      expect(regRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['course'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockCourse.id);
    });

    it('should return an empty array when user has no courses', async () => {
      regRepo.find.mockResolvedValue([]);

      const result = await service.findUserCourses('user-1');

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
  });
});
