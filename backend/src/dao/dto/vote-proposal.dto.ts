import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VoteType {
  APPROVE = 'approve',
  REJECT = 'reject',
  ABSTAIN = 'abstain',
}

export class VoteProposalDto {
  @ApiProperty({
    description: 'Type of vote',
    enum: VoteType,
    example: VoteType.APPROVE,
  })
  @IsEnum(VoteType)
  vote: VoteType;

  @ApiProperty({
    description: 'Optional comment explaining the vote',
    example: 'Great proposal, would be valuable for beginners',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
