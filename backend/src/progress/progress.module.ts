import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress } from './entities/progress.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { CertificatesModule } from 'src/certificates/certificates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Progress, Lesson]),
    CertificatesModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
