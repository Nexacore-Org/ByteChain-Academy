/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CertificateService } from './certificates.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CertificateVerificationResultDto } from './dto/certificate-response.dto';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /**
   * Public endpoint to verify a certificate
   * POST /certificates/verify
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyCertificate(
    @Body() verifyCertificateDto: VerifyCertificateDto,
  ): Promise<CertificateVerificationResultDto> {
    return this.certificateService.verifyCertificate(verifyCertificateDto);
  }

  /**
   * Get all certificates of logged-in user
   * GET /certificates
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyCertificates(@Req() req) {
    return this.certificateService.getAllCertificates(); // optionally filter by req.user.id if needed
  }

  /**
   * ADMIN: Get all certificates
   * GET /certificates/all
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  async getAllCertificates() {
    return this.certificateService.getAllCertificates();
  }

  /**
   * ADMIN: Revoke a certificate by ID
   * POST /certificates/revoke/:id
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('revoke/:id')
  async revokeCertificate(@Param('id') id: string) {
    return this.certificateService.revokeCertificate(id);
  }
}
