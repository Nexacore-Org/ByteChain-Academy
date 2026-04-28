import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, IsUrl, ValidateNested, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType } from '../entities/currency-entry.entity';

export class HistoricalDataPointDto {
  @ApiProperty({ example: '2024-01-15', description: 'Date of the historical data point (YYYY-MM-DD format)' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 45000, description: 'Price at the given date' })
  @IsInt()
  price: number;

  @ApiProperty({ example: 850000000000, description: 'Market capitalization (optional)', required: false })
  @IsOptional()
  @IsInt()
  marketCap?: number;

  @ApiProperty({ example: 19000000, description: 'Circulating supply (optional)', required: false })
  @IsOptional()
  @IsInt()
  circulatingSupply?: number;
}

export class CreateCurrencyDto {
  @ApiProperty({ example: 'Bitcoin', description: 'name field' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'BTC', description: 'symbol field' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]+$/, { message: 'Symbol must contain only uppercase letters' })
  symbol: string;

  @ApiProperty({ enum: CurrencyType, example: CurrencyType.CRYPTO, description: 'type field' })
  @IsEnum(CurrencyType)
  type: CurrencyType;

  @ApiProperty({ example: 'A decentralized digital currency.', description: 'description field' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://example.com/logo.png', description: 'logoUrl field', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ example: 2009, description: 'Year the currency was launched (optional, minimum 1600)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1600)
  launchYear?: number;

  @ApiProperty({ type: [HistoricalDataPointDto], description: 'Array of historical price data points (optional)', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataPointDto)
  historicalData?: HistoricalDataPointDto[];
}

export class UpdateCurrencyDto {
  @ApiProperty({ example: 'Bitcoin', description: 'Full name of the currency', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 'BTC', description: 'Currency symbol (uppercase letters only)', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]+$/, { message: 'Symbol must contain only uppercase letters' })
  symbol?: string;

  @ApiProperty({ enum: CurrencyType, example: CurrencyType.CRYPTO, description: 'Type of currency', required: false })
  @IsOptional()
  @IsEnum(CurrencyType)
  type?: CurrencyType;

  @ApiProperty({ example: 'A decentralized digital currency.', description: 'Detailed description', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', description: 'URL to the currency logo', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ example: 2009, description: 'launchYear field', required: false })
  @IsOptional()
  @IsInt()
  @Min(1600)
  launchYear?: number;

  @ApiProperty({ type: [HistoricalDataPointDto], description: 'Array of historical price data points', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataPointDto)
  historicalData?: HistoricalDataPointDto[];
}
