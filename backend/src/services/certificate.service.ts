import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { VerifyCertificateDto, CertificateVerificationResultDto, IssueCertificateDto } from '../dto/certificate.dto';
import * as crypto from 'crypto';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  /**
   * Generates a hash for a certificate based on its data
   */
  private generateCertificateHash(data: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    return hash;
  }

  /**
   * Issues a new certificate
   */
  async issueCertificate(issueCertificateDto: IssueCertificateDto): Promise<any> {
    const { recipientName, recipientEmail, courseOrProgram, issuedAt, expiresAt, certificateData } = issueCertificateDto;

    // Generate unique hash for the certificate
    const hashData = {
      recipientName,
      recipientEmail,
      courseOrProgram,
      issuedAt,
      timestamp: Date.now(),
    };

    const certificateHash = this.generateCertificateHash(hashData);

    // Check if certificate already exists
    const existingCertificate = await this.certificateRepository.findOne({
      where: { certificateHash },
    });

    if (existingCertificate) {
      throw new BadRequestException('Certificate with this hash already exists');
    }

    // Create new certificate
    const certificate = this.certificateRepository.create({
      certificateHash,
      recipientName,
      recipientEmail,
      courseOrProgram,
      issuedAt,
      expiresAt,
      certificateData: JSON.stringify(certificateData || {}),
      isValid: true,
    });

    await this.certificateRepository.save(certificate);

    return {
      id: certificate.id,
      certificateHash,
      message: 'Certificate issued successfully',
    };
  }

  /**
   * Verifies a certificate by its hash
   */
  async verifyCertificate(verifyCertificateDto: VerifyCertificateDto): Promise<CertificateVerificationResultDto> {
    const { certificateHash } = verifyCertificateDto;

    if (!certificateHash || certificateHash.trim() === '') {
      return {
        isValid: false,
        message: 'Certificate hash is required',
      };
    }

    const certificate = await this.certificateRepository.findOne({
      where: { certificateHash },
    });

    if (!certificate) {
      return {
        isValid: false,
        message: 'Certificate not found. Invalid or unknown certificate.',
      };
    }

    // Check if certificate is marked as valid
    if (!certificate.isValid) {
      return {
        isValid: false,
        message: 'Certificate is invalid or has been revoked.',
      };
    }

    // Check if certificate has expired
    if (certificate.expiresAt && new Date() > certificate.expiresAt) {
      return {
        isValid: false,
        message: 'Certificate has expired.',
      };
    }

    // Certificate is valid
    return {
      isValid: true,
      message: 'Certificate is valid and verified.',
      certificate: {
        id: certificate.id,
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        courseOrProgram: certificate.courseOrProgram,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        isValid: certificate.isValid,
        certificateData: certificate.certificateData ? JSON.parse(certificate.certificateData) : null,
      },
    };
  }

  /**
   * Gets all certificates (admin only)
   */
  async getAllCertificates(): Promise<any[]> {
    return this.certificateRepository.find();
  }

  /**
   * Revokes a certificate
   */
  async revokeCertificate(certificateId: string): Promise<any> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    certificate.isValid = false;
    await this.certificateRepository.save(certificate);

    return {
      message: 'Certificate revoked successfully',
      certificateId,
    };
  }
}
