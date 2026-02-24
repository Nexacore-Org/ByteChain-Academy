import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CourseRegistration } from './entities/course-registration.entity';
import { PaginationService } from 'src/common/services/pagination.service';

const mockRepo = () => ({ findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() });

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: mockRepo() },
        { provide: getRepositoryToken(CourseRegistration), useValue: mockRepo() },
        { provide: PaginationService, useValue: { paginate: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }) } },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
