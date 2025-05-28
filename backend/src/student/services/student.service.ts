import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { CreateStudentService } from './create.student.service';
import { PasswordHashingService } from './password.hashing.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly createStudentService: CreateStudentService,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}
  public async createStudent(
    createStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return await this.createStudentService.create(createStudentDto);
  }

  public async findAll(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  public async findOneById(id: string): Promise<Student | null> {
    return await this.studentRepository.findOne({ where: { id } });
  }

  public async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Partial<Student>> {
    const student = await this.findOneById(id);

    if (updateStudentDto.password) {
      updateStudentDto.password =
        await this.passwordHashingService.hashPassword(
          updateStudentDto.password,
        );
    }

    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  public async delete(id: string): Promise<void> {
    // Fetch full student entity
    const student = await this.findOneById(id);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Remove full entity (not Partial<Student>)
    await this.studentRepository.softDelete(student);
  }
}
