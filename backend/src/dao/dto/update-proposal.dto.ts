import { PartialType } from '@nestjs/swagger';
import { CreateProposalDto } from './create-proposal.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProposalStatus } from './create-proposal.dto';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
  @ApiProperty({
    description: 'Status of the proposal',
    enum: ProposalStatus,
    example: ProposalStatus.UNDER_REVIEW,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;
}
