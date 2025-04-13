import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorService } from './services/tutor.service';
import { TutorController } from './tutor.controller';
import { Tutor } from './entities/tutor.entity';
import { PasswordHashingService } from './services/password.hashing.service';
import { BcryptHashingService } from './services/bcrypt.hashing.service';
import { CreateTutorService } from './services/create-tutor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tutor])],
  controllers: [TutorController],
  providers: [
    TutorService,
    {
      provide: PasswordHashingService,
      useClass: BcryptHashingService,
    },
    CreateTutorService,
  ],
  exports: [TutorService],
})
export class TutorModule {}
