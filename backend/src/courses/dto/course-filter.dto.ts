import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CourseFilterDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty({ required: false, description: 'Comma-separated tags' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ required: false, enum: ['createdAt', 'title', 'difficulty'] })
  @IsOptional()
  @IsIn(['createdAt', 'title', 'difficulty'])
  sortBy?: 'createdAt' | 'title' | 'difficulty';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
