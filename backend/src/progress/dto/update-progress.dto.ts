import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressDto } from './create-progress.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto extends PartialType(CreateProgressDto) {}

