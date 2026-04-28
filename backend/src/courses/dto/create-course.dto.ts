import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A concise description of the resource.', description: 'description field' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: true, description: 'published field', required: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

