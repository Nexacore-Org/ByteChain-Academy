import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CurrencyType {
  CRYPTO = 'CRYPTO',
  FIAT = 'FIAT',
}

export interface HistoricalPrice {
  date: string;
  price: number;
  marketCap?: number;
  circulatingSupply?: number;
}

@Entity('currency_entries')
export class CurrencyEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  symbol: string;

  @Column({
    type: 'simple-enum',
    enum: CurrencyType,
    default: CurrencyType.CRYPTO,
  })
  type: CurrencyType;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  historicalData: HistoricalPrice[];

  @Column({ nullable: true })
  launchYear: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
