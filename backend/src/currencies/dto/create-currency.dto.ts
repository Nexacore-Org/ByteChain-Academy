import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType } from '../entities/currency-entry.entity';

export class HistoricalDataPointDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date of the historical data point (YYYY-MM-DD format)',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 45000, description: 'Price at the given date' })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 850000000000,
    description: 'Market capitalization',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  marketCap?: number;

  @ApiProperty({
    example: 19000000,
    description: 'Circulating supply',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  circulatingSupply?: number;
}

export class CreateCurrencyDto {
  @ApiProperty({ example: 'Bitcoin', description: 'Full name of the currency' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'BTC', description: 'Currency symbol' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]+$/, {
    message: 'Symbol must contain only uppercase letters',
  })
  symbol: string;

  @ApiProperty({
    enum: CurrencyType,
    example: CurrencyType.CRYPTO,
    description: 'Type of currency',
  })
  @IsEnum(CurrencyType)
  type: CurrencyType;

  @ApiProperty({
    example:
      'Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer bitcoin network.',
    description: 'Detailed description of the currency',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'URL to the currency logo',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({
    example: 2009,
    description: 'Year the currency was launched',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  launchYear?: number;

  @ApiProperty({
    type: [HistoricalDataPointDto],
    description: 'Array of historical price data points',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalDataPointDto)
  historicalData?: HistoricalDataPointDto[];
}

export class UpdateCurrencyDto extends CreateCurrencyDto {}
