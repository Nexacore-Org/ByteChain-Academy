import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrencyType } from '../entities/currency-entry.entity';
import { ApiProperty } from '@nestjs/swagger';

export class HistoricalPriceDto {
  @ApiProperty({ example: 'example', description: 'date field' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 1, description: 'price field' })
  @IsInt()
  price: number;

  @ApiProperty({ example: 1, description: 'marketCap field', required: false })
  @IsOptional()
  @IsInt()
  marketCap?: number;

  @ApiProperty({ example: 1, description: 'circulatingSupply field', required: false })
  @IsOptional()
  @IsInt()
  circulatingSupply?: number;
}

export class CreateCurrencyDto {
  @ApiProperty({ example: 'Jane Doe', description: 'name field' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'example', description: 'symbol field' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ example: 'example', description: 'type field' })
  @IsEnum(CurrencyType)
  type: CurrencyType;

  @ApiProperty({ example: 'A concise description of the resource.', description: 'description field' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://example.com/resource', description: 'logoUrl field', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ example: [{ date: '2026-04-22T00:00:00.000Z', price: 1 }], description: 'historicalData field', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalPriceDto)
  historicalData?: HistoricalPriceDto[];

  @ApiProperty({ example: 1, description: 'launchYear field', required: false })
  @IsOptional()
  @IsInt()
  launchYear?: number;
}

export class UpdateCurrencyDto extends CreateCurrencyDto {}

