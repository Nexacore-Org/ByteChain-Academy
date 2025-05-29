import type { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';
import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from './services/courses.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('CoursesService', () => {
  let service: CoursesService;
  let repository: MockRepository<Course>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    repository = module.get<MockRepository<Course>>(getRepositoryToken(Course));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        price: 29.99,
      };

      const expectedCourse = {
        id: 'test-id',
        ...createCourseDto,
      };

      repository.create.mockReturnValue(expectedCourse);
      repository.save.mockResolvedValue(expectedCourse);

      const result = await service.create(createCourseDto);

      expect(repository.create).toHaveBeenCalledWith(createCourseDto);
      expect(repository.save).toHaveBeenCalledWith(expectedCourse);
      expect(result).toEqual(expectedCourse);
    });
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      const expectedCourses = [
        {
          id: 'test-id-1',
          title: 'Test Course 1',
        },
        {
          id: 'test-id-2',
          title: 'Test Course 2',
        },
      ];

      repository.find.mockResolvedValue(expectedCourses);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['lessons', 'quizzes'],
      });
      expect(result).toEqual(expectedCourses);
    });
  });

  describe('findOne', () => {
    it('should return a course when it exists', async () => {
      const courseId = 'test-id';
      const expectedCourse = {
        id: courseId,
        title: 'Test Course',
      };

      repository.findOne.mockResolvedValue(expectedCourse);

      const result = await service.findOne(courseId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: courseId },
        relations: ['lessons', 'quizzes'],
      });
      expect(result).toEqual(expectedCourse);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const courseId = 'non-existent-id';

      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(courseId)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: courseId },
        relations: ['lessons', 'quizzes'],
      });
    });
  });

  describe('update', () => {
    it('should update and return a course when it exists', async () => {
      const courseId = 'test-id';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
      };

      const existingCourse = {
        id: courseId,
        title: 'Test Course',
      };

      const updatedCourse = {
        ...existingCourse,
        ...updateCourseDto,
      };

      repository.findOne.mockResolvedValue(existingCourse);
      repository.save.mockResolvedValue(updatedCourse);

      const result = await service.update(courseId, updateCourseDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: courseId },
        relations: ['lessons', 'quizzes'],
      });
      expect(repository.save).toHaveBeenCalledWith(updatedCourse);
      expect(result).toEqual(updatedCourse);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const courseId = 'non-existent-id';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(courseId, updateCourseDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: courseId },
        relations: ['lessons', 'quizzes'],
      });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a course when it exists', async () => {
      const courseId = 'test-id';

      repository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(courseId);

      expect(repository.delete).toHaveBeenCalledWith(courseId);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const courseId = 'non-existent-id';

      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(courseId)).rejects.toThrow(NotFoundException);

      expect(repository.delete).toHaveBeenCalledWith(courseId);
    });
  });
});
