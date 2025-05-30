import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyHubController } from './currency-hub.controller';
import { CurrencyHubService } from './currency-hub.service';
import { RateType, SourceType } from './entities/currency-hub.entity';
import { NotFoundException } from '@nestjs/common';

describe('CurrencyHubController', () => {
  let controller: CurrencyHubController;
  let service: CurrencyHubService;

  beforeEach(async () => {
    const mockCurrencyHubService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findExchangeRate: jest.fn(),
      convertCurrency: jest.fn(),
      getHistoricalTrend: jest.fn(),
      getBestProvider: jest.fn(),
      updateExchangeRates: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyHubController],
      providers: [
        {
          provide: CurrencyHubService,
          useValue: mockCurrencyHubService,
        },
      ],
    }).compile();

    controller = module.get<CurrencyHubController>(CurrencyHubController);
    service = module.get<CurrencyHubService>(CurrencyHubService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new currency hub', async () => {
      const createDto = {
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'EUR',
        exchangeRate: 0.85,
        rateType: RateType.LIVE,
        sourceType: SourceType.API,
      };
      const result = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of currency hubs', async () => {
      const result = [
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
      const query = { baseCurrencyCode: 'USD' };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(query)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a currency hub', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const result = {
        id,
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'EUR',
        exchangeRate: 0.85,
        rateType: RateType.LIVE,
        sourceType: SourceType.API,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(id)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if currency hub not found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('getExchangeRate', () => {
    it('should return the exchange rate for a currency pair', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'EUR';
      const exchangeRate = 0.85;

      jest.spyOn(service, 'findExchangeRate').mockResolvedValue(exchangeRate);

      expect(
        await controller.getExchangeRate(baseCurrency, targetCurrency),
      ).toBe(exchangeRate);
      expect(service.findExchangeRate).toHaveBeenCalledWith(
        baseCurrency,
        targetCurrency,
      );
    });
  });

  describe('convertCurrency', () => {
    it('should convert an amount from one currency to another', async () => {
      const amount = 100;
      const fromCurrency = 'USD';
      const toCurrency = 'EUR';
      const convertedAmount = 85;

      jest.spyOn(service, 'convertCurrency').mockResolvedValue(convertedAmount);

      expect(
        await controller.convertCurrency(amount, fromCurrency, toCurrency),
      ).toBe(convertedAmount);
      expect(service.convertCurrency).toHaveBeenCalledWith(
        amount,
        fromCurrency,
        toCurrency,
      );
    });
  });

  describe('getHistoricalTrend', () => {
    it('should return historical trend data for a currency pair', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'EUR';
      const days = 30;
      const result = [
        { date: '2023-01-01', rate: 0.83 },
        { date: '2023-01-02', rate: 0.84 },
        { date: '2023-01-03', rate: 0.85 },
      ];

      jest.spyOn(service, 'getHistoricalTrend').mockResolvedValue(result);

      expect(
        await controller.getHistoricalTrend(baseCurrency, targetCurrency, days),
      ).toBe(result);
      expect(service.getHistoricalTrend).toHaveBeenCalledWith(
        baseCurrency,
        targetCurrency,
        days,
      );
    });
  });

  describe('getBestProvider', () => {
    it('should return the best provider for a currency pair', async () => {
      const baseCurrency = 'USD';
      const targetCurrency = 'EUR';
      const result = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        baseCurrencyCode: baseCurrency,
        targetCurrencyCode: targetCurrency,
        provider: 'Provider A',
        accuracy: 99.0,
        conversionSpread: 0.5,
      };

      jest.spyOn(service, 'getBestProvider').mockResolvedValue(result);

      expect(
        await controller.getBestProvider(baseCurrency, targetCurrency),
      ).toBe(result);
      expect(service.getBestProvider).toHaveBeenCalledWith(
        baseCurrency,
        targetCurrency,
      );
    });
  });

  describe('update', () => {
    it('should update a currency hub', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto = { exchangeRate: 0.86 };
      const result = {
        id,
        baseCurrencyCode: 'USD',
        targetCurrencyCode: 'EUR',
        exchangeRate: 0.86,
        rateType: RateType.LIVE,
        sourceType: SourceType.API,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(id, updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a currency hub', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      expect(await controller.remove(id)).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('updateRates', () => {
    it('should update exchange rates', async () => {
      jest.spyOn(service, 'updateExchangeRates').mockResolvedValue(undefined);

      expect(await controller.updateRates()).toBeUndefined();
      expect(service.updateExchangeRates).toHaveBeenCalled();
    });
  });
});
