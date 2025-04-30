import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { CreateProgressDto } from './dto/progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressTrackingService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {}

  async createProgress(
    createProgressDto: CreateProgressDto,
  ): Promise<Progress> {
    const progress = this.progressRepository.create(createProgressDto);
    return await this.progressRepository.save(progress);
  }

  async updateProgress(
    progressId: number,
    updateProgressDto: UpdateProgressDto,
  ): Promise<Progress> {
    const progress = await this.progressRepository.findOne({
      where: { id: progressId },
    });
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${progressId} not found`);
    }

    Object.assign(progress, updateProgressDto);
    return await this.progressRepository.save(progress);
  }

  async getStudentProgress(
    studentId: number,
    courseId: number,
  ): Promise<Progress> {
    const progress = await this.progressRepository.findOne({
      where: {
        student: { id: studentId.toString() },
        course: { id: courseId.toString() },
      },
    });
    if (!progress) {
      throw new NotFoundException(
        `Progress for student ${studentId} and course ${courseId} not found`,
      );
    }

    return progress;
  }

  async calculateCourseCompletion(
    studentId: number,
    courseId: number,
  ): Promise<number> {
    const progress = await this.getStudentProgress(studentId, courseId);
    const totalLessons = 10; // example, fetch dynamically
    const totalQuizzes = 5; // example, fetch dynamically

    const lessonCompletion = (progress.completedLessons / totalLessons) * 100;
    const quizCompletion = (progress.completedQuizzes / totalQuizzes) * 100;
    const courseCompletion = (lessonCompletion + quizCompletion) / 2;

    return courseCompletion;
  }
}
