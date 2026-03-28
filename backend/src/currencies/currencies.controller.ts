import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/create-currency.dto';
import { CurrencyType } from './entities/currency-entry.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Currencies Hub')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all currencies with optional filters' })
  @ApiQuery({ name: 'type', enum: CurrencyType, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  async findAll(
    @Query('type') type?: CurrencyType,
    @Query('search') search?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    return this.currenciesService.findAll(type, search, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single currency entry by ID with full history' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.currenciesService.findOne(id);
  }

  @Get('symbol/:symbol')
  @ApiOperation({ summary: 'Get a single currency entry by ticker symbol' })
  async findBySymbol(@Param('symbol') symbol: string) {
    return this.currenciesService.findBySymbol(symbol);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get filtered historical data for a currency' })
  @ApiQuery({ name: 'from', type: String, required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', type: String, required: false, description: 'YYYY-MM-DD' })
  async getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.currenciesService.getFilteredHistory(id, from, to);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin create a new currency entry' })
  async create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currenciesService.create(createCurrencyDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin update an existing currency entry' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin delete a currency entry' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.currenciesService.delete(id);
  }
}
