import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProposalDto {
  @ApiPropertyOptional({ example: 'Updated Curriculum Title' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description with more details.',
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;
}
