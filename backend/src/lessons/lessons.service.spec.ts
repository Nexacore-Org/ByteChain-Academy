import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Course } from 'src/courses/entities/course.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

describe('LessonsService', () => {
  let service: LessonsService;
  let lessonRepository: Repository<Lesson>;
  let courseRepository: Repository<Course>;

  const mockLessonRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCourseRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
    lessonRepository = module.get<Repository<Lesson>>(
      getRepositoryToken(Lesson),
    );
    courseRepository = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a lesson successfully', async () => {
      const createDto: CreateLessonDto = {
        title: 'Test Lesson',
        content: 'Test content',
        videoUrl: 'https://example.com/video.mp4',
        videoStartTimestamp: 30,
        order: 1,
        courseId: 'course-123',
      };

      const mockCourse = { id: 'course-123', title: 'Test Course' };
      const mockLesson = {
        id: 'lesson-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockLessonRepository.create.mockReturnValue(mockLesson);
      mockLessonRepository.save.mockResolvedValue(mockLesson);

      const result = await service.create(createDto);

      expect(result).toEqual(mockLesson);
      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.courseId },
      });
      expect(mockLessonRepository.create).toHaveBeenCalled();
      expect(mockLessonRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if course does not exist', async () => {
      const createDto: CreateLessonDto = {
        title: 'Test Lesson',
        content: 'Test content',
        courseId: 'non-existent',
      };

      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create lesson without optional video fields', async () => {
      const createDto: CreateLessonDto = {
        title: 'Test Lesson',
        content: 'Test content',
        courseId: 'course-123',
      };

      const mockCourse = { id: 'course-123', title: 'Test Course' };
      const mockLesson = {
        id: 'lesson-123',
        ...createDto,
        videoUrl: null,
        videoStartTimestamp: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockLessonRepository.create.mockReturnValue(mockLesson);
      mockLessonRepository.save.mockResolvedValue(mockLesson);

      const result = await service.create(createDto);

      expect(result.videoUrl).toBeNull();
      expect(result.videoStartTimestamp).toBeNull();
      expect(result.order).toBe(0);
    });
  });

  describe('findAllByCourse', () => {
    it('should return all lessons for a course ordered by order ASC', async () => {
      const courseId = 'course-123';
      const mockLessons = [
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          order: 1,
          courseId,
        },
        {
          id: 'lesson-2',
          title: 'Lesson 2',
          order: 2,
          courseId,
        },
      ];

      const mockCourse = { id: courseId, title: 'Test Course' };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockLessonRepository.find.mockResolvedValue(mockLessons);

      const result = await service.findAllByCourse(courseId);

      expect(result).toEqual(mockLessons);
      expect(mockLessonRepository.find).toHaveBeenCalledWith({
        where: { courseId },
        order: { order: 'ASC', createdAt: 'ASC' },
      });
    });

    it('should throw NotFoundException if course does not exist', async () => {
      const courseId = 'non-existent';

      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.findAllByCourse(courseId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a lesson by id', async () => {
      const lessonId = 'lesson-123';
      const mockLesson = {
        id: lessonId,
        title: 'Test Lesson',
        content: 'Test content',
        courseId: 'course-123',
      };

      mockLessonRepository.findOne.mockResolvedValue(mockLesson);

      const result = await service.findOne(lessonId);

      expect(result).toEqual(mockLesson);
      expect(mockLessonRepository.findOne).toHaveBeenCalledWith({
        where: { id: lessonId },
        relations: ['course'],
      });
    });

    it('should throw NotFoundException if lesson does not exist', async () => {
      const lessonId = 'non-existent';

      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(lessonId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update lesson successfully', async () => {
      const lessonId = 'lesson-123';
      const updateDto: UpdateLessonDto = {
        title: 'Updated Title',
        videoUrl: 'https://example.com/new-video.mp4',
      };

      const existingLesson = {
        id: lessonId,
        title: 'Original Title',
        content: 'Content',
        videoUrl: 'https://example.com/old-video.mp4',
        order: 1,
        courseId: 'course-123',
      };

      const updatedLesson = {
        ...existingLesson,
        ...updateDto,
      };

      mockLessonRepository.findOne.mockResolvedValue(existingLesson);
      mockLessonRepository.save.mockResolvedValue(updatedLesson);

      const result = await service.update(lessonId, updateDto);

      expect(result.title).toBe(updateDto.title);
      expect(result.videoUrl).toBe(updateDto.videoUrl);
      expect(mockLessonRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if lesson does not exist', async () => {
      const lessonId = 'non-existent';
      const updateDto: UpdateLessonDto = { title: 'Updated Title' };

      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(service.update(lessonId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should only update provided fields', async () => {
      const lessonId = 'lesson-123';
      const updateDto: UpdateLessonDto = {
        title: 'Updated Title',
      };

      const existingLesson = {
        id: lessonId,
        title: 'Original Title',
        content: 'Original Content',
        videoUrl: 'https://example.com/video.mp4',
        order: 1,
        courseId: 'course-123',
      };

      mockLessonRepository.findOne.mockResolvedValue(existingLesson);
      mockLessonRepository.save.mockResolvedValue({
        ...existingLesson,
        title: 'Updated Title',
      });

      const result = await service.update(lessonId, updateDto);

      expect(result.title).toBe('Updated Title');
      expect(result.content).toBe('Original Content');
    });
  });

  describe('remove', () => {
    it('should remove lesson successfully', async () => {
      const lessonId = 'lesson-123';
      const mockLesson = {
        id: lessonId,
        title: 'Test Lesson',
      };

      mockLessonRepository.findOne.mockResolvedValue(mockLesson);
      mockLessonRepository.remove.mockResolvedValue(mockLesson);

      await service.remove(lessonId);

      expect(mockLessonRepository.remove).toHaveBeenCalledWith(mockLesson);
    });

    it('should throw NotFoundException if lesson does not exist', async () => {
      const lessonId = 'non-existent';

      mockLessonRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(lessonId)).rejects.toThrow(NotFoundException);
    });
  });
});
