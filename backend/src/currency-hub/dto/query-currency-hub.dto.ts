// src/currency-hub/dto/query-currency-hub.dto.ts
import { IsEnum, IsOptional, IsString, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
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
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  // New: Pagination
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  // New: Search
  @IsOptional()
  @IsString()
  search?: string;
}
