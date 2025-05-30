import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonQuizResult } from '../entities/lesson-quiz-result.entity';
import { Student } from 'src/student/entities/student.entity';
import { CreateResultDto } from '../dtos/CreateResultDto';

@Injectable()
export class LessonQuizResultsService {
  constructor(
    @InjectRepository(LessonQuizResult)
    private resultRepo: Repository<LessonQuizResult>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async addResult(
    studentId: string,
    dto: CreateResultDto,
  ): Promise<LessonQuizResult> {
    const student = await this.studentRepo.findOneByOrFail({ id: studentId });

    const result = this.resultRepo.create({ ...dto, student });
    return this.resultRepo.save(result);
  }

  async getResults(studentId: string): Promise<LessonQuizResult[]> {
    return this.resultRepo.find({
      where: { student: { id: studentId } },
      order: { completedAt: 'DESC' },
    });
  }
}
