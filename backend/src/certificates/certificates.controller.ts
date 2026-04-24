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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CertificateService } from './certificates.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CertificateVerificationResultDto } from './dto/certificate-response.dto';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /**
   * Public endpoint to verify a certificate by hash
   * GET /certificates/verify/:hash
   */
  @Get('verify/:hash')
  @ApiOperation({ summary: 'Verify certificate by hash (public)' })
  @ApiResponse({ status: 200, description: 'Certificate verification result' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async verifyCertificateByHash(@Param('hash') hash: string) {
    return this.certificateService.verifyCertificateByHash(hash);
  }

  /**
   * Legacy POST verify (body-based)
   * POST /certificates/verify
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify certificate using request body (legacy)' })
  @ApiResponse({ status: 200, description: 'Certificate verification result', type: CertificateVerificationResultDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid certificate hash' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user certificates with download links' })
  @ApiResponse({ status: 200, description: 'User certificates retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all user certificates (legacy)' })
  @ApiResponse({ status: 200, description: 'User certificates retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all certificates (admin only)' })
  @ApiResponse({ status: 200, description: 'All certificates retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  async getAllCertificates(@Query('search') search?: string) {
    return this.certificateService.getAllCertificates(search);
  }

  /**
   * Download a certificate PDF (owner only)
   * GET /certificates/:id/download
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/download')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Download certificate PDF' })
  @ApiResponse({ status: 200, description: 'Certificate PDF downloaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not certificate owner' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoke a certificate (admin only)' })
  @ApiResponse({ status: 200, description: 'Certificate revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async revokeCertificatePost(@Param('id') id: string) {
    return this.certificateService.revokeCertificate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/revoke')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoke a certificate (admin only)' })
  @ApiResponse({ status: 200, description: 'Certificate revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async revokeCertificatePatch(@Param('id') id: string) {
    return this.certificateService.revokeCertificate(id);
  }
}
