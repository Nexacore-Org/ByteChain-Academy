import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrencyType } from '../entities/currency-entry.entity';

export class HistoricalPriceDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsInt()
  price: number;

  @IsOptional()
  @IsInt()
  marketCap?: number;

  @IsOptional()
  @IsInt()
  circulatingSupply?: number;
}

export class CreateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsEnum(CurrencyType)
  type: CurrencyType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoricalPriceDto)
  historicalData?: HistoricalPriceDto[];

  @IsOptional()
  @IsInt()
  launchYear?: number;
}

export class UpdateCurrencyDto extends CreateCurrencyDto {}
