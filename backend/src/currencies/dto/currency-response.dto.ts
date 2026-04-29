import {
  CurrencyType,
  HistoricalPrice,
} from '../entities/currency-entry.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CurrencyResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'id field',
  })
  id: string;
  @ApiProperty({ example: 'Jane Doe', description: 'name field' })
  name: string;
  @ApiProperty({ example: 'example', description: 'symbol field' })
  symbol: string;
  @ApiProperty({ example: 'example', description: 'type field' })
  type: CurrencyType;
  @ApiProperty({
    example: 'A concise description of the resource.',
    description: 'description field',
  })
  description: string;
  @ApiProperty({
    example: 'https://example.com/resource',
    description: 'logoUrl field',
    required: false,
  })
  logoUrl?: string;
  @ApiProperty({ example: 1, description: 'launchYear field', required: false })
  launchYear?: number;
  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'createdAt field',
  })
  createdAt: Date;
  @ApiProperty({
    example: '2026-04-22T00:00:00.000Z',
    description: 'updatedAt field',
  })
  updatedAt: Date;
}

export class CurrencyDetailResponseDto extends CurrencyResponseDto {
  @ApiProperty({
    example: [{ date: '2026-04-22T00:00:00.000Z', price: 1 }],
    description: 'historicalData field',
  })
  historicalData: HistoricalPrice[];
}
