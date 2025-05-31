// src/currency-hub/currency-hub.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, Like } from 'typeorm';
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

  async create(createCurrencyHubDto: CreateCurrencyHubDto): Promise<CurrencyHub> {
    const currencyHub = this.currencyHubRepository.create(createCurrencyHubDto);
    return this.currencyHubRepository.save(currencyHub);
  }

  async findAll(query: QueryCurrencyHubDto = {}): Promise<{ data: CurrencyHub[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      baseCurrencyCode,
      targetCurrencyCode,
      rateType,
      provider,
      sourceType,
      from,
      to,
    } = query;

    const where: FindOptionsWhere<CurrencyHub>[] = [];

    const baseFilters: FindOptionsWhere<CurrencyHub> = {};

    if (baseCurrencyCode) baseFilters.baseCurrencyCode = baseCurrencyCode;
    if (targetCurrencyCode) baseFilters.targetCurrencyCode = targetCurrencyCode;
    if (rateType) baseFilters.rateType = rateType;
    if (provider) baseFilters.provider = provider;
    if (sourceType) baseFilters.sourceType = sourceType;
    if (from && to) baseFilters.createdAt = Between(new Date(from), new Date(to));

    if (search) {
      where.push(
        { ...baseFilters, baseCurrencyCode: Like(`%${search}%`) },
        { ...baseFilters, targetCurrencyCode: Like(`%${search}%`) },
        { ...baseFilters, provider: Like(`%${search}%`) },
      );
    } else {
      where.push(baseFilters);
    }

    const [data, total] = await this.currencyHubRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  // Other methods remain unchanged...
}
