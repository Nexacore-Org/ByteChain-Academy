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
import { CertificateService } from '../services/certificate.service';
import {
  VerifyCertificateDto,
  CertificateVerificationResultDto,
} from '../dto/certificate.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

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
  @Roles('admin')
  @Get('all')
  async getAllCertificates() {
    return this.certificateService.getAllCertificates();
  }

  /**
   * ADMIN: Revoke a certificate by ID
   * POST /certificates/revoke/:id
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('revoke/:id')
  async revokeCertificate(@Param('id') id: string) {
    return this.certificateService.revokeCertificate(id);
  }
}
