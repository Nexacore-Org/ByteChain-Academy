import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { CreateStudentDto } from '../dto/create-student.dto';
import { PasswordHashingService } from './password.hashing.service';

@Injectable()
export class CreateStudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  /**
   * Creates a new student.
   * @param createStudentDto Student data to create
   * @returns The created student
   */
  public async create(createStudentDto: CreateStudentDto): Promise<Student> {
    try {
      //Check if email already exists
      const existingStudent = await this.studentRepository.findOne({
        where: { email: createStudentDto.email },
      });

      if (existingStudent) {
        throw new ConflictException('Email already exists');
      }

      //Create student instance
      const newStudent = this.studentRepository.create({
        ...createStudentDto,
        password: await this.passwordHashingService.hashPassword(
          createStudentDto.password,
        ),
      });

      return await this.studentRepository.save(newStudent);
    } catch {
      throw new InternalServerErrorException('Error creating student');
    }
  }
}
