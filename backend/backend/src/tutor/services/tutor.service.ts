import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutor } from '../entities/tutor.entity';
import { CreateTutorDto } from '../dto/create-tutor.dto';
import { UpdateTutorDto } from '../dto/update-tutor.dto';
import { PasswordHashingService } from './password.hashing.service';
import { CreateTutorService } from './create-tutor.service';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    private passwordHashingService: PasswordHashingService,
    private readonly createTutorService: CreateTutorService,
  ) {}

  findAll(): Promise<Tutor[]> {
    return this.tutorRepository.find();
  }

  findOne(id: string): Promise<Tutor> {
    return this.tutorRepository.findOne({ where: { id } });
  }

  async create(createTutorDto: CreateTutorDto): Promise<Tutor> {
    return this.createTutorService.create(createTutorDto);
  }

  async update(id: string, updateTutorDto: UpdateTutorDto): Promise<Tutor> {
    const tutor = await this.findOne(id);
    if (!tutor) throw new Error('Tutor not found');

    if (updateTutorDto.password) {
      updateTutorDto.password = await this.passwordHashingService.hashPassword(
        updateTutorDto.password,
      );
    }

    Object.assign(tutor, updateTutorDto);
    return this.tutorRepository.save(tutor);
  }

  async delete(id: string): Promise<void> {
    const tutor = await this.findOne(id);

    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }
    await this.tutorRepository.softDelete(id);
  }
}
