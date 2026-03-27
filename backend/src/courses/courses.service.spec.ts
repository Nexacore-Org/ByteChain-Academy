import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CourseRegistration } from './entities/course-registration.entity';
import { PaginationService } from 'src/common/services/pagination.service';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Progress } from 'src/progress/entities/progress.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: mockRepo() },
        {
          provide: getRepositoryToken(CourseRegistration),
          useValue: mockRepo(),
        },
        { provide: getRepositoryToken(Lesson), useValue: mockRepo() },
        { provide: getRepositoryToken(Progress), useValue: mockRepo() },
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
