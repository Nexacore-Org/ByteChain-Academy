import { SearchCurrencyDto } from './dto/search-currency.dto'; 
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { CurrencyHubService } from './currency-hub.service';
import { CreateCurrencyHubDto } from './dto/create-currency-hub.dto';
import { UpdateCurrencyHubDto } from './dto/update-currency-hub.dto';
import { QueryCurrencyHubDto } from './dto/query-currency-hub.dto';

@Controller('currency-hub')
export class CurrencyHubController {
  constructor(private readonly currencyHubService: CurrencyHubService) {}

  @Get('search')
searchWithPagination(@Query() dto: SearchCurrencyDto) {
  return this.currencyHubService.searchAndPaginateCurrencies(dto);
}

  @Post()
  create(@Body() createCurrencyHubDto: CreateCurrencyHubDto) {
    return this.currencyHubService.create(createCurrencyHubDto);
  }

  @Get()
  findAll(@Query() query: QueryCurrencyHubDto) {
    return this.currencyHubService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.currencyHubService.findOne(id);
  }

  @Get('rate/:base/:target')
  getExchangeRate(
    @Param('base') baseCurrency: string,
    @Param('target') targetCurrency: string,
  ) {
    return this.currencyHubService.findExchangeRate(
      baseCurrency,
      targetCurrency,
    );
  }

  @Get('convert')
  convertCurrency(
    @Query('amount', ParseFloatPipe) amount: number,
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    return this.currencyHubService.convertCurrency(
      amount,
      fromCurrency,
      toCurrency,
    );
  }

  @Get('trends/:base/:target')
  getHistoricalTrend(
    @Param('base') baseCurrency: string,
    @Param('target') targetCurrency: string,
    @Query('days', ParseFloatPipe) days?: number,
  ) {
    return this.currencyHubService.getHistoricalTrend(
      baseCurrency,
      targetCurrency,
      days,
    );
  }

  @Get('best-provider/:base/:target')
  getBestProvider(
    @Param('base') baseCurrency: string,
    @Param('target') targetCurrency: string,
  ) {
    return this.currencyHubService.getBestProvider(
      baseCurrency,
      targetCurrency,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCurrencyHubDto: UpdateCurrencyHubDto,
  ) {
    return this.currencyHubService.update(id, updateCurrencyHubDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.currencyHubService.remove(id);
  }

  @Post('update-rates')
  updateRates() {
    return this.currencyHubService.updateExchangeRates();
  }
}
