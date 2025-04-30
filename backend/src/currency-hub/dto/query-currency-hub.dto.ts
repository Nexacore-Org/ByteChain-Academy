import { IsOptional, IsString, IsEnum } from 'class-validator';
import { RateType, SourceType } from '../entities/currency-hub.entity';

export class QueryCurrencyHubDto {
  @IsOptional()
  @IsString()
  baseCurrencyCode?: string;

  @IsOptional()
  @IsString()
  targetCurrencyCode?: string;

  @IsOptional()
  @IsEnum(RateType)
  rateType?: RateType;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;

  @IsOptional()
  @IsString()
  from?: string; // Date range for exchangeRate query

  @IsOptional()
  @IsString()
  to?: string; // Date range for exchangeRate query
}
