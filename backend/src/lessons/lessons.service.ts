import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { In, Repository } from 'typeorm';
import { PaginationService } from '../common/services/pagination.service';
import { PaginatedResult } from '../common/services/pagination.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Quiz } from '../quizzes/entities/quiz.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: createLessonDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createLessonDto.courseId} not found`,
      );
    }

    // Create lesson
    const lesson = this.lessonRepository.create({
      title: createLessonDto.title,
      content: createLessonDto.content,
      videoUrl: createLessonDto.videoUrl,
      videoStartTimestamp: createLessonDto.videoStartTimestamp,
      order: createLessonDto.order ?? 0,
      courseId: createLessonDto.courseId,
    });

    return this.lessonRepository.save(lesson);
  }

  async findAllByCourse(courseId: string): Promise<Lesson[]> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return this.lessonRepository.find({
      where: { courseId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Lesson>> {
    return this.paginationService.paginate(
      this.lessonRepository,
      { page, limit },
      {
        order: { order: 'ASC', createdAt: 'ASC' },
      },
    );
  }

  async findAllByCoursePaginated(
    courseId: string,
    page: number,
    limit: number,
  ): Promise<
    PaginatedResult<Lesson & { hasQuiz: boolean; quizId: string | null }>
  > {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const result = await this.paginationService.paginate(
      this.lessonRepository,
      { page, limit },
      {
        where: { courseId },
        order: { order: 'ASC', createdAt: 'ASC' },
      },
    );

    const lessonIds = result.data.map((l) => l.id);
    const quizzes = lessonIds.length
      ? await this.quizRepository.find({
          where: { lessonId: In(lessonIds) },
          select: ['id', 'lessonId'],
        })
      : [];
    const quizMap = new Map(quizzes.map((q) => [q.lessonId, q.id]));

    return {
      ...result,
      data: result.data.map((l) => ({
        ...l,
        hasQuiz: quizMap.has(l.id),
        quizId: quizMap.get(l.id) ?? null,
      })),
    };
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async findOneWithQuizFlag(
    id: string,
  ): Promise<Lesson & { hasQuiz: boolean; quizId: string | null }> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    const quiz = await this.quizRepository.findOne({
      where: { lessonId: id },
      select: ['id'],
    });

    return { ...lesson, hasQuiz: !!quiz, quizId: quiz?.id ?? null };
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Update fields if provided
    if (updateLessonDto.title !== undefined) {
      lesson.title = updateLessonDto.title;
    }
    if (updateLessonDto.content !== undefined) {
      lesson.content = updateLessonDto.content;
    }
    if (updateLessonDto.videoUrl !== undefined) {
      lesson.videoUrl = updateLessonDto.videoUrl;
    }
    if (updateLessonDto.videoStartTimestamp !== undefined) {
      lesson.videoStartTimestamp = updateLessonDto.videoStartTimestamp;
    }
    if (updateLessonDto.order !== undefined) {
      lesson.order = updateLessonDto.order;
    }

    return this.lessonRepository.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    await this.lessonRepository.remove(lesson);
  }

  async reorderLessons(courseId: string, orderedIds: string[]): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        this.lessonRepository.update({ id, courseId }, { order: index }),
      ),
    );
  }
}
