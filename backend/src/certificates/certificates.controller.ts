/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
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
   * Public endpoint to verify a certificate by hash
   * GET /certificates/verify/:hash
   */
  @Get('verify/:hash')
  async verifyCertificateByHash(@Param('hash') hash: string) {
    return this.certificateService.verifyCertificateByHash(hash);
  }

  /**
   * Legacy POST verify (body-based)
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
   * Get certificates for the authenticated user with download links
   * GET /certificates/my
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyCertificates(@Req() req) {
    const userId = req.user.id as string;
    return this.certificateService.getMyCertificates(userId);
  }

  /**
   * Get all certificates of logged-in user (legacy)
   * GET /certificates
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMyCertificates(@Req() req) {
    const userId = req.user.id as string;
    return this.certificateService.getCertificatesByUser(userId);
  }

  /**
   * ADMIN: Get all certificates
   * GET /certificates/all?search=...
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  async getAllCertificates(@Query('search') search?: string) {
    return this.certificateService.getAllCertificates(search);
  }

  /**
   * Download a certificate PDF (owner only)
   * GET /certificates/:id/download
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/download')
  async downloadCertificate(
    @Param('id') id: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const userId = req.user.id as string;
    const filePath = await this.certificateService.getCertificateForDownload(
      id,
      userId,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${id}.pdf"`,
    );

    const { createReadStream } = await import('fs');
    const stream = createReadStream(filePath);
    stream.pipe(res);
  }

  /**
   * ADMIN: Revoke a certificate by ID
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('revoke/:id')
  async revokeCertificatePost(@Param('id') id: string) {
    return this.certificateService.revokeCertificate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/revoke')
  async revokeCertificatePatch(@Param('id') id: string) {
    return this.certificateService.revokeCertificate(id);
  }
}
