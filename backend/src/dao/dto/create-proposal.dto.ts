import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({ 
    example: 'Update Curriculum for Advanced Frontend Development',
    description: 'The title of the proposal (10-200 characters)'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'This proposal aims to introduce advanced React patterns including custom hooks, context optimization, and performance best practices to the frontend course. The curriculum will be updated to include real-world projects and industry-standard coding practices.',
    description: 'The detailed description of the proposal (50-5000 characters)'
  })
  @ApiProperty({ example: 'A concise description of the resource.', description: 'description field' })
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(5000)
  description: string;
}

