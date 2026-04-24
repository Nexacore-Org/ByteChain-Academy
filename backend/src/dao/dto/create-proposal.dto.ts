import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({ example: 'Update Curriculum' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'Introduce advanced React patterns to the frontend course.',
  })
  @ApiProperty({ example: 'A concise description of the resource.', description: 'description field' })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  description: string;
}

