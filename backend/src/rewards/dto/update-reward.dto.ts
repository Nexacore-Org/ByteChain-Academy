import { PartialType } from '@nestjs/mapped-types';
import { CreateRewardDto } from './create-reward.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRewardDto extends PartialType(CreateRewardDto) {}
