import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Intro to Blockchain' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A concise description of the course.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ example: 'Beginner', required: false })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiProperty({ example: ['bitcoin', 'defi'], required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'https://example.com/thumb.jpg', required: false })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;
}
