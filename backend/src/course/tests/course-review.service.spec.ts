import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseReviewService } from '../services/course-review.service';
import { CourseReview } from '../../courses/entities/course-review.entity';
import { Course } from '../../courses/entities/course.entity';
import { CreateCourseReviewDto } from '../dto/create-course-review.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CourseReviewService', () => {
  let service: CourseReviewService;
  let reviewRepository: Repository<CourseReview>;
  let courseRepository: Repository<Course>;

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCourseRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseReviewService,
        {
          provide: getRepositoryToken(CourseReview),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
      ],
    }).compile();

    service = module.get<CourseReviewService>(CourseReviewService);
    reviewRepository = module.get<Repository<CourseReview>>(
      getRepositoryToken(CourseReview),
    );
    courseRepository = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReviewDto: CreateCourseReviewDto = {
      rating: 4,
      comment: 'Great course!',
      courseId: 'course-id',
    };
    const studentId = 'student-id';

    it('should create a review successfully', async () => {
      const course = { id: 'course-id' };
      const review = { ...createReviewDto, studentId };
      const savedReview = { ...review, id: 'review-id' };

      mockCourseRepository.findOne.mockResolvedValue(course);
      mockReviewRepository.findOne.mockResolvedValue(null);
      mockReviewRepository.create.mockReturnValue(review);
      mockReviewRepository.save.mockResolvedValue(savedReview);
      mockReviewRepository.find.mockResolvedValue([savedReview]);

      const result = await service.create(createReviewDto, studentId);

      expect(result).toEqual(savedReview);
      expect(mockCourseRepository.findOne).toHaveBeenCalled();
      expect(mockReviewRepository.create).toHaveBeenCalled();
      expect(mockReviewRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createReviewDto, studentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if student already reviewed', async () => {
      mockCourseRepository.findOne.mockResolvedValue({ id: 'course-id' });
      mockReviewRepository.findOne.mockResolvedValue({ id: 'existing-review' });

      await expect(service.create(createReviewDto, studentId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of reviews', async () => {
      const courseId = 'course-id';
      const reviews = [
        { id: '1', rating: 4, comment: 'Great!' },
        { id: '2', rating: 5, comment: 'Excellent!' },
      ];

      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findAll(courseId);

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { courseId },
        relations: ['student'],
      });
    });
  });

  describe('update', () => {
    it('should update a review successfully', async () => {
      const id = 'review-id';
      const studentId = 'student-id';
      const updateDto = { rating: 5, comment: 'Updated comment' };
      const existingReview = {
        id,
        studentId,
        courseId: 'course-id',
        rating: 4,
        comment: 'Original comment',
      };
      const updatedReview = { ...existingReview, ...updateDto };

      mockReviewRepository.findOne.mockResolvedValue(existingReview);
      mockReviewRepository.save.mockResolvedValue(updatedReview);
      mockReviewRepository.find.mockResolvedValue([updatedReview]);
      mockCourseRepository.findOne.mockResolvedValue({ id: 'course-id' });

      const result = await service.update(id, updateDto, studentId);

      expect(result).toEqual(updatedReview);
      expect(mockReviewRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if student is not the owner', async () => {
      const id = 'review-id';
      const studentId = 'student-id';
      const updateDto = { rating: 5 };
      const existingReview = {
        id,
        studentId: 'different-student-id',
        rating: 4,
      };

      mockReviewRepository.findOne.mockResolvedValue(existingReview);

      await expect(service.update(id, updateDto, studentId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
