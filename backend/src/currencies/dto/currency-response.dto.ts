import { CurrencyType, HistoricalPrice } from '../entities/currency-entry.entity';

export class CurrencyResponseDto {
  id: string;
  name: string;
  symbol: string;
  type: CurrencyType;
  description: string;
  logoUrl?: string;
  launchYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CurrencyDetailResponseDto extends CurrencyResponseDto {
  historicalData: HistoricalPrice[];
}
