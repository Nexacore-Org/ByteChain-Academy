import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntry, CurrencyType } from './entities/currency-entry.entity';
import {
  CreateCurrencyDto,
  UpdateCurrencyDto,
} from './dto/create-currency.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(CurrencyEntry)
    private readonly currencyRepository: Repository<CurrencyEntry>,
  ) {}

  async findAll(
    type?: CurrencyType,
    search?: string,
    paginationDto?: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.currencyRepository.createQueryBuilder('currency');

    if (type) {
      queryBuilder.andWhere('currency.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(currency.name LIKE :search OR currency.symbol LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const formattedItems = items.map((item) => {
      // Omit detailed historical data in find all list to reduce payload
      const { historicalData: _historicalData, ...rest } = item;
      return rest;
    });

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) {
      throw new NotFoundException(`Currency with ID "${id}" not found`);
    }
    return currency;
  }

  async findBySymbol(symbol: string) {
    const currency = await this.currencyRepository.findOne({
      where: { symbol },
    });
    if (!currency) {
      throw new NotFoundException(`Currency with symbol "${symbol}" not found`);
    }
    return currency;
  }

  async getFilteredHistory(id: string, from?: string, to?: string) {
    const currency = await this.findOne(id);
    let history = currency.historicalData || [];

    if (from) {
      history = history.filter((h) => h.date >= from);
    }

    if (to) {
      history = history.filter((h) => h.date <= to);
    }

    return history;
  }

  async create(createCurrencyDto: CreateCurrencyDto) {
    const currency = this.currencyRepository.create(createCurrencyDto);
    return await this.currencyRepository.save(currency);
  }

  async update(id: string, updateCurrencyDto: UpdateCurrencyDto) {
    const currency = await this.findOne(id);
    Object.assign(currency, updateCurrencyDto);
    return await this.currencyRepository.save(currency);
  }

  async delete(id: string) {
    const result = await this.currencyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Currency with ID "${id}" not found`);
    }
    return { message: 'Currency entry deleted successfully' };
  }
}
