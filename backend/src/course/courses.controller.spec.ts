import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import type { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './services/courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  beforeEach(async () => {
    const mockCoursesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createCourseDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        price: 29.99,
      };

      const expectedResult = {
        id: 'test-id',
        ...createCourseDto,
      };

      // jest.spyOn(service, "create").mockResolvedValue(expectedResult)

      const result = await controller.create(createCourseDto);

      expect(service.create).toHaveBeenCalledWith(createCourseDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      const expectedResult = [
        {
          id: 'test-id-1',
          title: 'Test Course 1',
        },
        {
          id: 'test-id-2',
          title: 'Test Course 2',
        },
      ];

      // jest.spyOn(service, "findAll").mockResolvedValue(expectedResult)

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const courseId = 'test-id';
      const expectedResult = {
        id: courseId,
        title: 'Test Course',
      };

      // jest.spyOn(service, "findOne").mockResolvedValue(expectedResult)

      const result = await controller.findOne(courseId);

      expect(service.findOne).toHaveBeenCalledWith(courseId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const courseId = 'non-existent-id';

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(courseId)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findOne).toHaveBeenCalledWith(courseId);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const courseId = 'test-id';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
      };

      const expectedResult = {
        id: courseId,
        title: 'Updated Course',
      };

      // jest.spyOn(service, "update").mockResolvedValue(expectedResult)

      const result = await controller.update(courseId, updateCourseDto);

      expect(service.update).toHaveBeenCalledWith(courseId, updateCourseDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const courseId = 'non-existent-id';
      const updateCourseDto: UpdateCourseDto = {
        title: 'Updated Course',
      };

      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(
        controller.update(courseId, updateCourseDto),
      ).rejects.toThrow(NotFoundException);

      expect(service.update).toHaveBeenCalledWith(courseId, updateCourseDto);
    });
  });

  describe('remove', () => {
    it('should remove a course', async () => {
      const courseId = 'test-id';

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(courseId);

      expect(service.remove).toHaveBeenCalledWith(courseId);
    });

    it('should throw NotFoundException when course does not exist', async () => {
      const courseId = 'non-existent-id';

      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(courseId)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.remove).toHaveBeenCalledWith(courseId);
    });
  });
});
