import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'src/course/entities/course.entity';
import { Lesson } from '../entities/lessons.entity';

describe('LessonsService', () => {
  let service: LessonsService;
  let lessonRepo: Repository<Lesson>;
  let courseRepo: Repository<Course>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Course),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
    lessonRepo = module.get<Repository<Lesson>>(getRepositoryToken(Lesson));
    courseRepo = module.get<Repository<Course>>(getRepositoryToken(Course));
  });

  it('should create a lesson successfully', async () => {
    const createLessonDto = {
      title: 'Lesson 1',
      description: 'First lesson',
      videoUrl: 'http://video.com/lesson1',
      courseId: 'course-uuid',
    };

    jest
      .spyOn(courseRepo, 'findOne')
      .mockResolvedValue({ id: 'course-uuid' } as Course);
    jest.spyOn(lessonRepo, 'create').mockReturnValue(createLessonDto as any);
    jest
      .spyOn(lessonRepo, 'save')
      .mockResolvedValue({ id: 'lesson-uuid', ...createLessonDto } as Lesson);

    const result = await service.create(createLessonDto);

    expect(result).toHaveProperty('id');
    expect(result.title).toEqual('Lesson 1');
  });

  it('should throw if course not found', async () => {
    jest.spyOn(courseRepo, 'findOne').mockResolvedValue(null);

    await expect(
      service.create({
        title: 'Lesson',
        description: 'Desc',
        videoUrl: 'http://url.com',
        courseId: 'invalid-course',
      }),
    ).rejects.toThrow('Course not found');
  });
});
