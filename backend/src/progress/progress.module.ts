import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { CertificatesModule } from 'src/certificates/certificates.module';

@Module({
  imports: [TypeOrmModule.forFeature([Progress]), CertificatesModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
