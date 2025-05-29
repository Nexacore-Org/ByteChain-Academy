import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordHashingService } from './password.hashing.service';
import { Tutor } from '../entities/tutor.entity';
import { CreateTutorDto } from '../dto/create-tutor.dto';
import { MailService } from 'src/common/mail/providers/mail.service';

@Injectable()
export class CreateTutorService {
  constructor(
    @InjectRepository(Tutor)
    /**
     * Inject mailService
     */
    private readonly mailService: MailService,
    private readonly tutorRepository: Repository<Tutor>,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  public async create(createTutorDto: CreateTutorDto): Promise<Tutor> {
    try {
      //Check if email already exists
      const existingTutor = await this.tutorRepository.findOne({
        where: { email: createTutorDto.email },
      });

      if (existingTutor) {
        throw new ConflictException('Email already exists');
      }

      //Create student instance
      const newTutor = this.tutorRepository.create({
        ...createTutorDto,
        password: await this.passwordHashingService.hashPassword(
          createTutorDto.password,
        ),
      });

      try {
        await this.mailService.welcomeEmail(newTutor);
      } catch (error) {
        throw new RequestTimeoutException(error);
      }

      return await this.tutorRepository.save(newTutor);
    } catch {
      throw new InternalServerErrorException('Error creating student');
    }
  }
}
