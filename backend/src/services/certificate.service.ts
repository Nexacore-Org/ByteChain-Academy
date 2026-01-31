import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import {
  VerifyCertificateDto,
  CertificateVerificationResultDto,
  IssueCertificateDto,
} from '../dto/certificate.dto';
import { User } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import * as crypto from 'crypto';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                HASH UTILITY                                */
  /* -------------------------------------------------------------------------- */

  private generateCertificateHash(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /* -------------------------------------------------------------------------- */
  /*                        AUTO ISSUE (COURSE COMPLETION)                       */
  /* -------------------------------------------------------------------------- */

  /**
   * Issues certificate automatically when a course is completed
   * (THIS is what solves Issue #125)
   */
  async issueCertificateForCourse(
    userId: string,
    courseId: string,
  ): Promise<Certificate> {
    // Prevent duplicates (user + course)
    const existing = await this.certificateRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
    });

    if (existing) return existing;

    const user = await this.userRepository.findOneBy({ id: userId });
    const course = await this.courseRepository.findOneBy({ id: courseId });

    if (!user || !course) {
      throw new NotFoundException('User or course not found');
    }

    const issuedAt = new Date();

    const hashPayload = {
      userId: user.id,
      courseId: course.id,
      issuedAt,
    };

    const certificateHash = this.generateCertificateHash(hashPayload);

    const certificate = this.certificateRepository.create({
      certificateHash,
      recipientName: user.name,
      recipientEmail: user.email,
      courseOrProgram: course.title,
      certificateData: JSON.stringify({
        userId: user.id,
        courseId: course.id,
      }),
      issuedAt,
      isValid: true,
      user,
      course,
    });

    return this.certificateRepository.save(certificate);
  }

  /* -------------------------------------------------------------------------- */
  /*                          MANUAL / ADMIN ISSUANCE                            */
  /* -------------------------------------------------------------------------- */

  async issueCertificate(
    issueCertificateDto: IssueCertificateDto,
  ): Promise<any> {
    const {
      recipientName,
      recipientEmail,
      courseOrProgram,
      issuedAt,
      expiresAt,
      certificateData,
    } = issueCertificateDto;

    const hashPayload = {
      recipientName,
      recipientEmail,
      courseOrProgram,
      issuedAt,
      timestamp: Date.now(),
    };

    const certificateHash = this.generateCertificateHash(hashPayload);

    const existing = await this.certificateRepository.findOne({
      where: { certificateHash },
    });

    if (existing) {
      throw new BadRequestException(
        'Certificate with this hash already exists',
      );
    }

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

  /* -------------------------------------------------------------------------- */
  /*                              VERIFICATION                                   */
  /* -------------------------------------------------------------------------- */

  async verifyCertificate(
    verifyCertificateDto: VerifyCertificateDto,
  ): Promise<CertificateVerificationResultDto> {
    const { certificateHash } = verifyCertificateDto;

    if (!certificateHash?.trim()) {
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

    if (!certificate.isValid) {
      return {
        isValid: false,
        message: 'Certificate is invalid or has been revoked.',
      };
    }

    if (certificate.expiresAt && new Date() > certificate.expiresAt) {
      return {
        isValid: false,
        message: 'Certificate has expired.',
      };
    }

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
        certificateData: certificate.certificateData
          ? JSON.parse(certificate.certificateData)
          : null,
      },
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  ADMIN                                      */
  /* -------------------------------------------------------------------------- */

  async getAllCertificates(): Promise<Certificate[]> {
    return this.certificateRepository.find();
  }

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
