import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '../entities/dao-vote.entity';

export class CastVoteDto {
  @ApiProperty({ 
    enum: VoteType, 
    example: VoteType.YES,
    description: 'Vote type: YES, NO, or ABSTAIN'
  })
  @IsNotEmpty()
  @IsEnum(VoteType)
  vote: VoteType;
}