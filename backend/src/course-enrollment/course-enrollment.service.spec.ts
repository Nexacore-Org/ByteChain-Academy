import { Test, TestingModule } from '@nestjs/testing';
import { CourseEnrollmentService } from './course-enrollment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entities/course.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CourseEnrollmentService', () => {
  let service: CourseEnrollmentService;
  let enrollmentRepository: Repository<CourseEnrollment>;
  let studentRepository: Repository<Student>;
  let courseRepository: Repository<Course>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseEnrollmentService,
        {
          provide: getRepositoryToken(CourseEnrollment),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Course),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CourseEnrollmentService>(CourseEnrollmentService);
    enrollmentRepository = module.get<Repository<CourseEnrollment>>(
      getRepositoryToken(CourseEnrollment),
    );
    studentRepository = module.get<Repository<Student>>(
      getRepositoryToken(Student),
    );
    courseRepository = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
  });

  it('should enroll a student into a course', async () => {
    const studentId = 'student-id';
    const courseId = 'course-id';

    jest
      .spyOn(studentRepository, 'findOne')
      .mockResolvedValue({ id: studentId } as Student);
    jest
      .spyOn(courseRepository, 'findOne')
      .mockResolvedValue({ id: courseId } as Course);
    jest.spyOn(enrollmentRepository, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(enrollmentRepository, 'create')
      .mockImplementation((data) => data as CourseEnrollment);
    jest.spyOn(enrollmentRepository, 'save').mockImplementation((enrollment) =>
      Promise.resolve({
        id: 'enrollment-id',
        ...enrollment,
      } as CourseEnrollment),
    );

    const enrollment = await service.enroll(studentId, courseId);

    expect(enrollment).toBeDefined();
    expect(enrollment.student.id).toEqual(studentId);
    expect(enrollment.course.id).toEqual(courseId);
  });

  it('should throw ConflictException when enrolling again', async () => {
    const studentId = 'student-id';
    const courseId = 'course-id';

    jest
      .spyOn(studentRepository, 'findOne')
      .mockResolvedValue({ id: studentId } as Student);
    jest
      .spyOn(courseRepository, 'findOne')
      .mockResolvedValue({ id: courseId } as Course);
    jest.spyOn(enrollmentRepository, 'findOne').mockResolvedValue({
      id: 'existing-enrollment-id',
      student: { id: studentId },
      course: { id: courseId },
    } as CourseEnrollment);

    await expect(service.enroll(studentId, courseId)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw NotFoundException if student does not exist', async () => {
    const studentId = 'student-id';
    const courseId = 'course-id';

    jest.spyOn(studentRepository, 'findOne').mockResolvedValue(undefined);
    jest
      .spyOn(courseRepository, 'findOne')
      .mockResolvedValue({ id: courseId } as Course);

    await expect(service.enroll(studentId, courseId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if course does not exist', async () => {
    const studentId = 'student-id';
    const courseId = 'course-id';

    jest
      .spyOn(studentRepository, 'findOne')
      .mockResolvedValue({ id: studentId } as Student);
    jest.spyOn(courseRepository, 'findOne').mockResolvedValue(undefined);

    await expect(service.enroll(studentId, courseId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should allow student to leave a course', async () => {
    const studentId = 'student-id';
    const courseId = 'course-id';
    const enrollment = {
      id: 'enrollment-id',
      student: { id: studentId },
      course: { id: courseId },
    } as CourseEnrollment;

    jest.spyOn(enrollmentRepository, 'findOne').mockResolvedValue(enrollment);
    jest.spyOn(enrollmentRepository, 'remove').mockResolvedValue(undefined);

    await expect(
      service.leaveCourse(studentId, courseId),
    ).resolves.toBeUndefined();
    expect(() => enrollmentRepository.remove(enrollment)).not.toThrow();
  });

  it('should throw NotFoundException if enrollment does not exist when leaving', async () => {
    const studentId = 'student-id';
    const courseId = 'course-id';

    jest.spyOn(enrollmentRepository, 'findOne').mockResolvedValue(undefined);

    await expect(service.leaveCourse(studentId, courseId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
