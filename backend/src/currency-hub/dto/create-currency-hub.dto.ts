import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RateType, SourceType } from '../entities/currency-hub.entity';

class MarketTrendDto {
  @IsString()
  @IsEnum(['up', 'down', 'stable'])
  direction: 'up' | 'down' | 'stable';

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsString()
  period: string;
}

export class CreateCurrencyHubDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 10)
  baseCurrencyCode: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 10)
  targetCurrencyCode: string;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '0,8' })
  exchangeRate: number;

  @IsEnum(RateType)
  rateType: RateType;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  conversionSpread?: number;

  @IsEnum(SourceType)
  sourceType: SourceType;

  @IsOptional()
  @IsObject()
  historicalRates?: Record<string, number>;

  @IsOptional()
  @ValidateNested()
  @Type(() => MarketTrendDto)
  marketTrend?: MarketTrendDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
