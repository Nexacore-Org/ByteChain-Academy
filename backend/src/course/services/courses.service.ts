import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { CreateCourseDto } from "../dto/create-course.dto"
import { UpdateCourseDto } from "../dto/update-course.dto"
import { Course } from "../entities/course.entity"

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto)
    return this.coursesRepository.save(course)
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find({
      relations: ["lessons", "quizzes"],
    })
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ["lessons", "quizzes"],
    })

    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`)
    }

    return course
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id)

    // Update the course with the new values
    Object.assign(course, updateCourseDto)

    return this.coursesRepository.save(course)
  }

  async remove(id: string): Promise<void> {
    const result = await this.coursesRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID "${id}" not found`)
    }
  }
}
