import { Module } from '@nestjs/common';
import { DAOService } from './dao.service';
import { DAOController } from './dao.controller';

@Module({
  controllers: [DAOController],
  providers: [DAOService],
  exports: [DAOService],
})
export class DAOModule {}
