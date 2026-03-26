import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DAOProposal } from './entities/dao-proposal.entity';
import { DAOVote } from './entities/dao-vote.entity';
import { User } from '../users/entities/user.entity';
import { DAOService } from './dao.service';
import { DAOController } from './dao.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DAOProposal, DAOVote, User])],
  controllers: [DAOController],
  providers: [DAOService],
  exports: [DAOService],
})
export class DAOModule {}
