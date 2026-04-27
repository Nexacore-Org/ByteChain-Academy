import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ModerateProposalDto {
  @ApiProperty({
    description: 'Reason for moderating the proposal',
    example: 'Spam content that violates community guidelines',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
