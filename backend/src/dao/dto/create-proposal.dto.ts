import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProposalType {
  COURSE = 'course',
  LESSON = 'lesson',
  ARTICLE = 'article',
}

export enum ProposalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

export class CreateProposalDto {
  @ApiProperty({
    description: 'Title of the proposal',
    example: 'Introduction to Smart Contracts',
    minLength: 5,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the proposal',
    example:
      'A comprehensive course covering the fundamentals of smart contract development on Ethereum',
    minLength: 20,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Type of content being proposed',
    enum: ProposalType,
    example: ProposalType.COURSE,
  })
  @IsEnum(ProposalType)
  type: ProposalType;

  @ApiProperty({
    description: 'Tags associated with the proposal',
    example: ['blockchain', 'ethereum', 'smart-contracts'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'Estimated duration in hours (for courses/lessons)',
    example: 40,
    required: false,
  })
  @IsOptional()
  estimatedDuration?: number;

  @ApiProperty({
    description: 'Prerequisites for the content',
    example: 'Basic understanding of JavaScript and blockchain concepts',
    required: false,
  })
  @IsOptional()
  @IsString()
  prerequisites?: string;

  @ApiProperty({
    description: 'Learning objectives',
    example: [
      'Understand smart contract basics',
      'Deploy contracts on testnet',
    ],
    isArray: true,
    type: String,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningObjectives?: string[];
}
