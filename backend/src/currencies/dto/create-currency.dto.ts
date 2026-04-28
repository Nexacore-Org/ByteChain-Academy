import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, IsUrl, ValidateNested, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType } from '../entities/currency-entry.entity';
import { ApiProperty } from '@nestjs/swagger';

export class HistoricalPriceDto {
  @ApiProperty({ example: 'example', description: 'date field' })
export class HistoricalDataPointDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date of the historical data point (YYYY-MM-DD format)'
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 1, description: 'price field' })
  @IsInt()
  price: number;

  @ApiProperty({ example: 1, description: 'marketCap field', required: false })
  @ApiProperty({
    example: 45000,
    description: 'Price at the given date'
  })
  @IsInt()
  price: number;

  @ApiProperty({
    example: 850000000000,
    description: 'Market capitalization (optional)',
    required: false
  })
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
  @Matches(/^[A-Z]+$/, { message: 'Symbol must contain only uppercase letters' })
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
  @ApiProperty({
    example: 2009,
    description: 'Year the currency was launched (optional, minimum 1600)',
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1600)
  launchYear?: number;

  @ApiProperty({
    type: [HistoricalDataPointDto],
    description: 'Array of historical price data points (optional)',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataPointDto)
  historicalData?: HistoricalDataPointDto[];
}

export class UpdateCurrencyDto {
  @ApiProperty({
    example: 'Bitcoin',
    description: 'Full name of the currency',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    example: 'BTC',
    description: 'Currency symbol (uppercase letters only)',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]+$/, { message: 'Symbol must contain only uppercase letters' })
  symbol?: string;

  @ApiProperty({
    enum: CurrencyType,
    example: CurrencyType.CRYPTO,
    description: 'Type of currency: CRYPTO or FIAT',
    required: false
  })
  @IsOptional()
  @IsEnum(CurrencyType)
  type?: CurrencyType;

  @ApiProperty({
    example: 'Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer bitcoin network.',
    description: 'Detailed description of the currency',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'URL to the currency logo',
    required: false
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ example: 1, description: 'launchYear field', required: false })
  @IsOptional()
  @IsInt()
  @Min(1600)
  launchYear?: number;

export class UpdateCurrencyDto extends CreateCurrencyDto {}

  @ApiProperty({
    type: [HistoricalDataPointDto],
    description: 'Array of historical price data points',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataPointDto)
  historicalData?: HistoricalDataPointDto[];
}
