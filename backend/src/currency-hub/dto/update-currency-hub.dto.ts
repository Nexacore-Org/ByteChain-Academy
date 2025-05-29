import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrencyHubDto } from './create-currency-hub.dto';

export class UpdateCurrencyHubDto extends PartialType(CreateCurrencyHubDto) {}
