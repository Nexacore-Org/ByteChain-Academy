import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum RateType {
  LIVE = 'live',
  HISTORICAL = 'historical',
  PROJECTED = 'projected',
}

export enum SourceType {
  API = 'api',
  MANUAL = 'manual',
  CALCULATED = 'calculated',
}

@Entity('currency_hubs')
export class CurrencyHub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  baseCurrencyCode: string;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  targetCurrencyCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  exchangeRate: number;

  @Column({ type: 'enum', enum: RateType, default: RateType.LIVE })
  rateType: RateType;

  @Column({ nullable: true })
  provider: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  conversionSpread: number;

  @Column({ type: 'enum', enum: SourceType, default: SourceType.API })
  sourceType: SourceType;

  @Column({ type: 'jsonb', nullable: true })
  historicalRates: Record<string, number>; // Date to rate mapping

  @Column({ type: 'jsonb', nullable: true })
  marketTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  accuracy: number;

  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  validTo: Date;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}