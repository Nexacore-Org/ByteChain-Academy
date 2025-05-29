import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { StudentService } from './services/student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from '../student/entities/student.entity';
import { Roles } from 'src/roles/roles.decorator';
import { UserRole } from 'src/roles/roles.enum';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('student')
@Roles(UserRole.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /**
   * Create a new student
   * @param createStudentDto
   */
  @Post()
  public async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<Student> {
    return this.studentService.createStudent(createStudentDto);
  }

  /**
   *Get all students
   */
  @Get()
  public async findAll(): Promise<Partial<Student>[]> {
    return this.studentService.findAll();
  }

  /**
   *Get a student by ID
   * @param id - Student ID
   */
  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<Partial<Student>> {
    return this.studentService.findOneById(id);
  }

  /**
   *Update a student
   * @param id - Student ID
   * @param updateStudentDto - student data to update
   */
  @Patch(':id')
  public async updateStudent(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Partial<Student>> {
    return this.studentService.update(id, updateStudentDto);
  }

  /**
   *Delete a student
   * @param id studentId
   */
  @Delete(':id')
  public async deleteStudent(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.studentService.delete(id);
    return { message: 'Student deleted successfully' };
  }
}
