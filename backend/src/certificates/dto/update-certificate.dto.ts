import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificateDto } from './create-certificate.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}
