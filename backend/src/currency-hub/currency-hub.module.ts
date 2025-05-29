import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyHubService } from './currency-hub.service';
import { CurrencyHubController } from './currency-hub.controller';
import { CurrencyHub } from './entities/currency-hub.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyHub])],
  controllers: [CurrencyHubController],
  providers: [CurrencyHubService],
  exports: [CurrencyHubService],
})
export class CurrencyHubModule {}