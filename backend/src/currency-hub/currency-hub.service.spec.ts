import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyHubService } from './currency-hub.service';
import {
  CurrencyHub,
  RateType,
  SourceType,
} from './entities/currency-hub.entity';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

describe('CurrencyHubService', () => {
  let service: CurrencyHubService;
  let repository: MockRepository<CurrencyHub>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyHubService,
        {
          provide: getRepositoryToken(CurrencyHub),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    service = module.get<CurrencyHubService>(CurrencyHubService);
    repository = module.get<MockRepository<CurrencyHub>>(
      getRepositoryToken(CurrencyHub),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new currency hub record', async () => {
      const createDto = {
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'EUR',
        exchangeRate: 0.85,
        rateType: RateType.LIVE,
        sourceType: SourceType.API,
      };
      const currencyHub = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockReturnValue(currencyHub);
      repository.save.mockResolvedValue(currencyHub);

      const result = await service.create(createDto);
      expect(result).toEqual(currencyHub);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(currencyHub);
    });
  });

  describe('findAll', () => {
    it('should return an array of currency hubs', async () => {
      const expectedCurrencyHubs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          baseCurrencyCode: 'USD',
          targetCurrencyCode: 'EUR',
          exchangeRate: 0.85,
          rateType: RateType.LIVE,
          sourceType: SourceType.API,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      repository.find.mockResolvedValue(expectedCurrencyHubs);

      const result = await service.findAll();
      expect(result).toEqual(expectedCurrencyHubs);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should filter results based on query params', async () => {
      const query = {
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'EUR',
      };
      const expectedCurrencyHubs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          ...query,
          exchangeRate: 0.85,
          rateType: RateType.LIVE,
          sourceType: SourceType.API,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      repository.find.mockResolvedValue(expectedCurrencyHubs);

      const result = await service.findAll(query);
      expect(result).toEqual(expectedCurrencyHubs);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          baseCurrencyCode: 'USD',
          targetCurrencyCode: 'EUR',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a currency hub when found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const expectedCurrencyHub = {
        id,
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'EUR',
        exchangeRate: 0.85,
        rateType: RateType.LIVE,
        sourceType: SourceType.API,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOneBy.mockResolvedValue(expectedCurrencyHub);

      const result = await service.findOne(id);
      expect(result).toEqual(expectedCurrencyHub);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException when currency hub is not found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    });
  });

  describe('update', () => {
    it('should update and return a currency hub', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto = { exchangeRate: 0.86 };
      const existingCurrencyHub = {
        id,
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'EUR',
        exchangeRate: 0.85,
        rateType: RateType.LIVE,
        sourceType: SourceType.API,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedCurrencyHub = {
        ...existingCurrencyHub,
        exchangeRate: 0.86,
      };

      repository.findOneBy.mockResolvedValue(existingCurrencyHub);
      repository.merge.mockReturnValue(updatedCurrencyHub);
      repository.save.mockResolvedValue(updatedCurrencyHub);

      const result = await service.update(id, updateDto);
      expect(result).toEqual(updatedCurrencyHub);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(repository.merge).toHaveBeenCalledWith(
        existingCurrencyHub,
        updateDto,
      );
      expect(repository.save).toHaveBeenCalledWith(updatedCurrencyHub);
    });

    it('should throw NotFoundException when currency hub to update is not found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto = { exchangeRate: 0.86 };
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    });
  });

  describe('remove', () => {
    it('should delete a currency hub successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      repository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(id);
      expect(repository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when currency hub to delete is not found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('findExchangeRate', () => {
    it('should return exchange rate when found directly', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'EUR';
      const currencyHub = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        baseCurrencyCode: baseCurrency,
        targetCurrencyCode: targetCurrency,
        exchangeRate: 0.85,
        rateType: RateType.LIVE,
        sourceType: SourceType.API,
      };

      repository.findOne.mockResolvedValue(currencyHub);

      const result = await service.findExchangeRate(
        baseCurrency,
        targetCurrency,
      );
      expect(result).toEqual(0.85);
    });

    it('should calculate inverse rate when direct rate not found', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'EUR';

      // No direct USD to EUR rate
      repository.findOne.mockResolvedValueOnce(null);

      // But we have an EUR to USD rate
      repository.findOne.mockResolvedValueOnce({
        baseCurrencyCode: targetCurrency,
        targetCurrencyCode: baseCurrency,
        exchangeRate: 1.18, // EUR to USD
      });

      const result = await service.findExchangeRate(
        baseCurrency,
        targetCurrency,
      );
      // 1 / 1.18 = ~0.847
      expect(result).toBeCloseTo(0.847, 3);
    });

    it('should throw NotFoundException when no exchange rate found', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'XYZ'; // Unknown currency

      // No direct or inverse rate found
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findExchangeRate(baseCurrency, targetCurrency),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('convertCurrency', () => {
    it('should return same amount when currencies are the same', async () => {
      const amount = 100;
      const currency = 'USD';

      const result = await service.convertCurrency(amount, currency, currency);
      expect(result).toEqual(amount);
    });

    it('should convert currency using direct exchange rate', async () => {
      const amount = 100;
      const fromCurrency = 'USD';
      const toCurrency = 'EUR';

      jest.spyOn(service, 'findExchangeRate').mockResolvedValue(0.85);

      const result = await service.convertCurrency(
        amount,
        fromCurrency,
        toCurrency,
      );
      expect(result).toEqual(85); // 100 * 0.85
    });
  });

  describe('getHistoricalTrend', () => {
    it('should return historical trend data', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'EUR';
      const days = 3;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

      const currencyHub = {
        baseCurrencyCode: baseCurrency,
        targetCurrencyCode: targetCurrency,
        historicalRates: {
          [todayStr]: 0.85,
          [yesterdayStr]: 0.84,
          [twoDaysAgoStr]: 0.83,
        },
      };

      repository.findOne.mockResolvedValue(currencyHub);

      const result = await service.getHistoricalTrend(
        baseCurrency,
        targetCurrency,
        days,
      );

      // Results should be in chronological order (oldest first)
      expect(result).toEqual([
        { date: twoDaysAgoStr, rate: 0.83 },
        { date: yesterdayStr, rate: 0.84 },
        { date: todayStr, rate: 0.85 },
      ]);
    });

    it('should throw NotFoundException when no historical data found', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'XYZ'; // Currency pair with no data

      repository.findOne.mockResolvedValue(null);

      await expect(
        service.getHistoricalTrend(baseCurrency, targetCurrency),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBestProvider', () => {
    it('should return the best provider based on accuracy and spread', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'EUR';

      const providers = [
        {
          id: '1',
          baseCurrencyCode: baseCurrency,
          targetCurrencyCode: targetCurrency,
          provider: 'Provider A',
          accuracy: 98.5,
          conversionSpread: 0.5,
        },
        {
          id: '2',
          baseCurrencyCode: baseCurrency,
          targetCurrencyCode: targetCurrency,
          provider: 'Provider B',
          accuracy: 99.0,
          conversionSpread: 0.7,
        },
      ];

      repository.find.mockResolvedValue([providers[1]]); // Provider B has better accuracy

      const result = await service.getBestProvider(
        baseCurrency,
        targetCurrency,
      );
      expect(result).toEqual(providers[1]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          baseCurrencyCode,
          targetCurrencyCode,
        },
        order: {
          accuracy: 'DESC',
          conversionSpread: 'ASC',
        },
        take: 1,
      });
    });

    it('should throw NotFoundException when no providers found', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'XYZ'; // Unusual currency pair with no providers

      repository.find.mockResolvedValue([]);

      await expect(
        service.getBestProvider(baseCurrency, targetCurrency),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchAndPaginateCurrencies', () => {
  it('returns filtered and paginated results', async () => {
    const result = await service.searchAndPaginateCurrencies({ search: 'usd', page: 1, limit: 5 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.data)).toBe(true);
  });
});
});
