import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntry, CurrencyType } from '../entities/currency-entry.entity';

@Injectable()
export class CurrenciesSeedService implements OnModuleInit {
  private readonly logger = new Logger(CurrenciesSeedService.name);

  constructor(
    @InjectRepository(CurrencyEntry)
    private readonly currencyRepository: Repository<CurrencyEntry>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const count = await this.currencyRepository.count();
    if (count > 0) {
      this.logger.log('Currencies already seeded. Skipping...');
      return;
    }

    this.logger.log('Seeding currencies...');

    const currencies: Partial<CurrencyEntry>[] = [
      // CRYPTO
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        type: CurrencyType.CRYPTO,
        description: 'Bitcoin is the first decentralized cryptocurrency, created in 2009 by an anonymous person or group known as Satoshi Nakamoto. It introduced the concept of a blockchain-based ledger and peer-to-peer electronic cash system.',
        launchYear: 2009,
        historicalData: this.generateHistoricalData(40000, 70000),
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        type: CurrencyType.CRYPTO,
        description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform, used to power transactions and decentralized applications.',
        launchYear: 2015,
        historicalData: this.generateHistoricalData(2000, 4000),
      },
      {
        name: 'Stellar',
        symbol: 'XLM',
        type: CurrencyType.CRYPTO,
        description: 'Stellar is an open-source, decentralized protocol for digital currency to fiat money transfers which allows cross-border transactions between any pair of currencies.',
        launchYear: 2014,
        historicalData: this.generateHistoricalData(0.1, 0.2),
      },
      {
        name: 'Binance Coin',
        symbol: 'BNB',
        type: CurrencyType.CRYPTO,
        description: 'BNB is the native token of the Binance ecosystem, powers the BNB Chain and can be used for trading fee discounts and various utilities within the Binance ecosystem.',
        launchYear: 2017,
        historicalData: this.generateHistoricalData(300, 600),
      },
      {
        name: 'Solana',
        symbol: 'SOL',
        type: CurrencyType.CRYPTO,
        description: 'Solana is a high-performance blockchain platform designed for decentralized applications and crypto-currencies. It uses a unique Proof of History (PoH) consensus mechanism.',
        launchYear: 2020,
        historicalData: this.generateHistoricalData(20, 200),
      },
      {
        name: 'Cardano',
        symbol: 'ADA',
        type: CurrencyType.CRYPTO,
        description: 'Cardano is a proof-of-stake blockchain platform that says its goal is to allow "changemakers, innovators and visionaries" to bring about positive global change.',
        launchYear: 2017,
        historicalData: this.generateHistoricalData(0.3, 1.2),
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        type: CurrencyType.CRYPTO,
        description: 'USD Coin (USDC) is a digital stablecoin that is pegged to the United States dollar and runs on several blockchains including Ethereum and Stellar.',
        launchYear: 2018,
        historicalData: this.generateHistoricalData(0.99, 1.01),
      },
      {
        name: 'Dogecoin',
        symbol: 'DOGE',
        type: CurrencyType.CRYPTO,
        description: 'Dogecoin is a cryptocurrency created by software engineers Billy Markus and Jackson Palmer, who decided to create a payment system as a "joke", making fun of the wild speculation in cryptocurrencies.',
        launchYear: 2013,
        historicalData: this.generateHistoricalData(0.05, 0.2),
      },
      {
        name: 'Litecoin',
        symbol: 'LTC',
        type: CurrencyType.CRYPTO,
        description: 'Litecoin is a peer-to-peer cryptocurrency and open-source software project released under the MIT/X11 license. It was an early bitcoin spinoff.',
        launchYear: 2011,
        historicalData: this.generateHistoricalData(60, 100),
      },
      {
        name: 'XRP',
        symbol: 'XRP',
        type: CurrencyType.CRYPTO,
        description: 'XRP is a digital asset built for payments. It is the native digital asset on the XRP Ledger—an open-source, permissionless and decentralized blockchain technology.',
        launchYear: 2012,
        historicalData: this.generateHistoricalData(0.4, 0.7),
      },
      // FIAT
      {
        name: 'United States Dollar',
        symbol: 'USD',
        type: CurrencyType.FIAT,
        description: 'The United States dollar is the official currency of the United States and several other countries. It is the worlds primary reserve currency.',
        launchYear: 1792,
        historicalData: this.generateHistoricalData(1, 1),
      },
      {
        name: 'Euro',
        symbol: 'EUR',
        type: CurrencyType.FIAT,
        description: 'The euro is the official currency of 20 of the 27 member states of the European Union. This group of states is known as the eurozone.',
        launchYear: 1999,
        historicalData: this.generateHistoricalData(1.05, 1.15),
      },
      {
        name: 'British Pound Sterling',
        symbol: 'GBP',
        type: CurrencyType.FIAT,
        description: 'The pound sterling is the official currency of the United Kingdom and its associated territories. It is the oldest currency in continuous use.',
        launchYear: 800,
        historicalData: this.generateHistoricalData(1.2, 1.4),
      },
      {
        name: 'Nigerian Naira',
        symbol: 'NGN',
        type: CurrencyType.FIAT,
        description: 'The naira is the currency of Nigeria. It is subdivided into 100 kobo. The Central Bank of Nigeria is the sole issuer of legal tender money throughout the Republic.',
        launchYear: 1973,
        historicalData: this.generateHistoricalData(0.0006, 0.001),
      },
      {
        name: 'Japanese Yen',
        symbol: 'JPY',
        type: CurrencyType.FIAT,
        description: 'The yen is the official currency of Japan. It is the third most traded currency in the foreign exchange market after the USD and the EUR.',
        launchYear: 1871,
        historicalData: this.generateHistoricalData(0.006, 0.008),
      },
    ];

    for (const data of currencies) {
      const entry = this.currencyRepository.create(data);
      await this.currencyRepository.save(entry);
    }

    this.logger.log(`Successfully seeded ${currencies.length} currencies.`);
  }

  private generateHistoricalData(minPrice: number, maxPrice: number) {
    const historicalData: any[] = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const randomPrice = parseFloat((Math.random() * (maxPrice - minPrice) + minPrice).toFixed(4));
      historicalData.push({
        date: date.toISOString().split('T')[0],
        price: randomPrice,
        marketCap: randomPrice * 1000000,
        circulatingSupply: 1000000,
      });
    }
    return historicalData;
  }
}
