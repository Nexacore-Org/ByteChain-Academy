import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentService } from './services/student.service';
import { StudentController } from './student.controller';
import { Student } from './entities/student.entity';
import { CreateStudentService } from './services/create.student.service';
import { BcryptHashingService } from './services/bcrypt.hashing.service';
import { PasswordHashingService } from './services/password.hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  providers: [
    StudentService,
    CreateStudentService,
    {
      provide: PasswordHashingService,
      useClass: BcryptHashingService,
    },
  ],
  controllers: [StudentController],
  exports: [StudentService, CreateStudentService],
})
export class StudentModule {}
