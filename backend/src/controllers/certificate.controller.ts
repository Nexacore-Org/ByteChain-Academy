import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CertificateService } from '../services/certificate.service';
import { VerifyCertificateDto, CertificateVerificationResultDto } from '../dto/certificate.dto';

@Controller('certificates')
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

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
}
