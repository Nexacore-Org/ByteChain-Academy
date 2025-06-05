// src/currency-hub/currency-hub.service.ts
import { SearchCurrencyDto } from './dto/search-currency.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { CurrencyHub } from './entities/currency-hub.entity';
import { CreateCurrencyHubDto } from './dto/create-currency-hub.dto';
import { UpdateCurrencyHubDto } from './dto/update-currency-hub.dto';
import { QueryCurrencyHubDto } from './dto/query-currency-hub.dto';

@Injectable()
export class CurrencyHubService {
  constructor(
    @InjectRepository(CurrencyHub)
    private currencyHubRepository: Repository<CurrencyHub>,
  ) {}

  /**
   * Create a new currency hub record
   */
  async create(
    createCurrencyHubDto: CreateCurrencyHubDto,
  ): Promise<CurrencyHub> {
    const currencyHub = this.currencyHubRepository.create(createCurrencyHubDto);
    return this.currencyHubRepository.save(currencyHub);
  }

  /**
   * Find all currency hubs with optional filtering
   */
  async findAll(query: QueryCurrencyHubDto = {}): Promise<CurrencyHub[]> {
    const where: FindOptionsWhere<CurrencyHub> = {};

    if (query.baseCurrencyCode) {
      where.baseCurrencyCode = query.baseCurrencyCode;
    }

    if (query.targetCurrencyCode) {
      where.targetCurrencyCode = query.targetCurrencyCode;
    }

    if (query.rateType) {
      where.rateType = query.rateType;
    }

    if (query.provider) {
      where.provider = query.provider;
    }

    if (query.sourceType) {
      where.sourceType = query.sourceType;
    }

    if (query.from && query.to) {
      where.createdAt = Between(new Date(query.from), new Date(query.to));
    }

    return this.currencyHubRepository.find({ where });
  }

  /**
   * Find a specific currency hub by ID
   */
  async findOne(id: string): Promise<CurrencyHub> {
    const currencyHub = await this.currencyHubRepository.findOneBy({ id });
    if (!currencyHub) {
      throw new NotFoundException(`Currency hub with ID "${id}" not found`);
    }
    return currencyHub;
  }

  /**
   * Find exchange rate between two currencies
   */
  async findExchangeRate(
    baseCurrency: string,
    targetCurrency: string,
  ): Promise<number> {
    const currencyHub = await this.currencyHubRepository.findOne({
      where: {
        baseCurrencyCode: baseCurrency,
        targetCurrencyCode: targetCurrency,
      },
    });

    if (!currencyHub) {
      // Try to find the inverse rate and calculate the reciprocal
      const inverseRate = await this.currencyHubRepository.findOne({
        where: {
          baseCurrencyCode: targetCurrency,
          targetCurrencyCode: baseCurrency,
        },
      });

      if (inverseRate) {
        return 1 / Number(inverseRate.exchangeRate);
      }

      throw new NotFoundException(
        `Exchange rate for ${baseCurrency}/${targetCurrency} not found`,
      );
    }

    return Number(currencyHub.exchangeRate);
  }

  /**
   * Convert an amount from one currency to another using latest exchange rates
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const exchangeRate = await this.findExchangeRate(
        fromCurrency,
        toCurrency,
      );
      return amount * exchangeRate;
    } catch (error) {
      // Try to find a common base currency (e.g., USD) to do a two-step conversion
      try {
        const usdToFrom = await this.findExchangeRate('USD', fromCurrency);
        const usdToTo = await this.findExchangeRate('USD', toCurrency);

        // Convert via USD as intermediary
        const amountInUsd = amount / usdToFrom;
        return amountInUsd * usdToTo;
      } catch {
        throw new NotFoundException(
          `Couldn't convert ${fromCurrency} to ${toCurrency}`,
        );
      }
    }
  }

  /**
   * Update an existing currency hub
   */
  async update(
    id: string,
    updateCurrencyHubDto: UpdateCurrencyHubDto,
  ): Promise<CurrencyHub> {
    const currencyHub = await this.findOne(id);
    this.currencyHubRepository.merge(currencyHub, updateCurrencyHubDto);
    return this.currencyHubRepository.save(currencyHub);
  }

  /**
   * Remove a currency hub
   */
  async remove(id: string): Promise<void> {
    const result = await this.currencyHubRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Currency hub with ID "${id}" not found`);
    }
  }

  /**
   * Get historical trends for a currency pair
   */
  async getHistoricalTrend(
    baseCurrency: string,
    targetCurrency: string,
    days: number = 30,
  ): Promise<{ date: string; rate: number }[]> {
    const currencyHub = await this.currencyHubRepository.findOne({
      where: {
        baseCurrencyCode: baseCurrency,
        targetCurrencyCode: targetCurrency,
      },
    });

    if (!currencyHub || !currencyHub.historicalRates) {
      throw new NotFoundException(
        `Historical rates for ${baseCurrency}/${targetCurrency} not found`,
      );
    }

    // Get dates for the last N days
    const result = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      if (currencyHub.historicalRates[dateString]) {
        result.push({
          date: dateString,
          rate: currencyHub.historicalRates[dateString],
        });
      }
    }

    return result.reverse(); // Return in chronological order
  }

  /**
   * Get the best provider for a currency pair based on accuracy and spread
   */
  async getBestProvider(
    baseCurrency: string,
    targetCurrency: string,
  ): Promise<CurrencyHub> {
    const currencyHubs = await this.currencyHubRepository.find({
      where: {
        baseCurrencyCode: baseCurrency,
        targetCurrencyCode: targetCurrency,
      },
      order: {
        accuracy: 'DESC',
        conversionSpread: 'ASC',
      },
      take: 1,
    });

    if (!currencyHubs.length) {
      throw new NotFoundException(
        `No providers found for ${baseCurrency}/${targetCurrency}`,
      );
    }

    return currencyHubs[0];
  }

  /**
   * Update exchange rates from external sources
   */
  async updateExchangeRates(): Promise<void> {
    // This method would integrate with external APIs to update exchange rates
    // Implementation depends on your specific data providers
    // For demonstration purposes, we'll just log a message
    console.log('Updating exchange rates from external sources...');
  }

  // Added Filter + Pagination
  async searchAndPaginateCurrencies(
  dto: SearchCurrencyDto,
): Promise<{
  data: CurrencyHub[];
  total: number;
  page: number;
  limit: number;
}> {
  const { search, page = 1, limit = 10 } = dto;

  const qb = this.currencyHubRepository.createQueryBuilder('currency');

  if (search) {
    qb.where('currency.baseCurrencyCode ILIKE :search', { search: `%${search}%` })
      .orWhere('currency.targetCurrencyCode ILIKE :search', { search: `%${search}%` })
      .orWhere('currency.provider ILIKE :search', { search: `%${search}%` });
  }

  const [data, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .orderBy('currency.createdAt', 'DESC')
    .getManyAndCount();

  return { data, total, page, limit };
}
}
