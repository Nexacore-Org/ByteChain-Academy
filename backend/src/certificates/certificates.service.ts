/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../certificates/entities/certificate.entity';

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { CertificateVerificationResultDto } from './dto/certificate-response.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                HASH UTILITY                                */
  /* -------------------------------------------------------------------------- */

  private generateCertificateHash(
    userId: string,
    courseId: string,
    issuedAt: Date,
  ): string {
    return crypto
      .createHash('sha256')
      .update(userId + courseId + issuedAt.toISOString())
      .digest('hex');
  }

  /* -------------------------------------------------------------------------- */
  /*                              PDF GENERATION                                 */
  /* -------------------------------------------------------------------------- */

  private async generatePdf(certificate: Certificate): Promise<string> {
    const storagePath =
      process.env.CERTIFICATE_STORAGE_PATH || 'uploads/certificates';

    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    const fileName = `${certificate.certificateHash}.pdf`;
    const filePath = path.join(storagePath, fileName);

    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/certificates/verify/${certificate.certificateHash}`;
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 120 });

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 60 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f9f7f2');

      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke('#1a3c5e');

      doc
        .rect(38, 38, doc.page.width - 76, doc.page.height - 76)
        .lineWidth(1)
        .stroke('#c9aa71');

      doc
        .fillColor('#1a3c5e')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('ByteChain Academy', 0, 70, { align: 'center' });

      doc
        .fillColor('#c9aa71')
        .fontSize(13)
        .font('Helvetica')
        .text('Blockchain Education for the Future', 0, 106, {
          align: 'center',
        });

      doc
        .moveTo(80, 130)
        .lineTo(doc.page.width - 80, 130)
        .lineWidth(1)
        .stroke('#c9aa71');

      doc
        .fillColor('#1a3c5e')
        .fontSize(18)
        .font('Helvetica')
        .text('CERTIFICATE OF COMPLETION', 0, 150, { align: 'center' });

      doc
        .fillColor('#333333')
        .fontSize(13)
        .font('Helvetica')
        .text('This is to certify that', 0, 195, { align: 'center' });

      doc
        .fillColor('#1a3c5e')
        .fontSize(26)
        .font('Helvetica-Bold')
        .text(certificate.recipientName ?? 'Valued Student', 0, 220, { align: 'center' });

      doc
        .moveTo(160, 256)
        .lineTo(doc.page.width - 160, 256)
        .lineWidth(1)
        .stroke('#c9aa71');

      doc
        .fillColor('#333333')
        .fontSize(13)
        .font('Helvetica')
        .text('has successfully completed the course', 0, 268, {
          align: 'center',
        });

      doc
        .fillColor('#1a3c5e')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(certificate.courseOrProgram, 0, 293, { align: 'center' });

      const issuedDate = new Date(certificate.issuedAt).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      );

      doc
        .fillColor('#555555')
        .fontSize(12)
        .font('Helvetica')
        .text(`Date of Completion: ${issuedDate}`, 0, 340, { align: 'center' });

      doc.image(qrBuffer, doc.page.width / 2 - 60, 375, { width: 120 });

      doc
        .fillColor('#555555')
        .fontSize(8)
        .font('Helvetica')
        .text('Scan to verify authenticity', 0, 502, { align: 'center' });

      doc
        .fillColor('#888888')
        .fontSize(7)
        .font('Helvetica')
        .text(`Certificate ID: ${certificate.certificateHash}`, 60, 520, {
          width: doc.page.width - 120,
          align: 'center',
        });

      doc
        .moveTo(80, 545)
        .lineTo(doc.page.width - 80, 545)
        .lineWidth(1)
        .stroke('#c9aa71');

      doc
        .fillColor('#888888')
        .fontSize(9)
        .font('Helvetica')
        .text(
          `© ${new Date().getFullYear()} ByteChain Academy · blockchain-powered education`,
          0,
          555,
          { align: 'center' },
        );

      doc.end();

      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return filePath;
  }

  /* -------------------------------------------------------------------------- */
  /*                        AUTO ISSUE (COURSE COMPLETION)                       */
  /* -------------------------------------------------------------------------- */

  /**
   * Issues a certificate automatically when a course is completed.
   *
   * This method enforces duplicate prevention at the service level by checking
   * if a certificate already exists for the given user and course combination.
   * If a certificate already exists for this user-course pair, it returns the
   * existing certificate instead of creating a new one. This ensures that only
   * one certificate per user per course can be issued, maintaining data integrity.
   *
   * @param userId - The ID of the user completing the course
   * @param courseId - The ID of the course being completed
   * @returns A Certificate entity (either newly created or existing)
   *
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

    const certificateHash = this.generateCertificateHash(
      user.id,
      course.id,
      issuedAt,
    );

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
    const savedCertificate = await this.certificateRepository.save(certificate);

    const pdfPath = await this.generatePdf(savedCertificate);
    savedCertificate.certificatePath = pdfPath;
    await this.certificateRepository.save(savedCertificate);

    await this.notificationsService.createNotification(
      userId,
      NotificationType.CERTIFICATE_ISSUED,
      `You received a certificate for ${course.title}.`,
      '/certificates',
    );

    const clientBaseUrl =
      this.configService.get<string>('CLIENT_URL') ?? 'http://localhost:3000';
    const downloadUrl = `${clientBaseUrl}/certificates/${savedCertificate.certificateHash}`;
    const username = user.name || user.username || user.email.split('@')[0];

    await this.emailService.sendCertificateEmail(
      user.email,
      username,
      course.title,
      savedCertificate.certificateHash,
      downloadUrl,
    );

    return savedCertificate;
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

    const certificateHash = this.generateCertificateHash(
      recipientName + recipientEmail,
      courseOrProgram,
      new Date(issuedAt),
    );

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
        recipientName: certificate.recipientName ?? 'Valued Student',
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

  async getAllCertificates(search?: string): Promise<{
    totalIssued: number;
    revoked: number;
    data: Certificate[];
  }> {
    const qb = this.certificateRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.user', 'user')
      .leftJoinAndSelect('cert.course', 'course');

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        '(cert.recipientName LIKE :term OR cert.recipientEmail LIKE :term OR cert.courseOrProgram LIKE :term)',
        { term },
      );
    }

    const data = await qb.orderBy('cert.issuedAt', 'DESC').getMany();
    const totalIssued = data.length;
    const revoked = data.filter((c) => !c.isValid).length;

    return { totalIssued, revoked, data };
  }

  async getCertificatesByUser(userId: string): Promise<Certificate[]> {
    return this.certificateRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getMyCertificates(userId: string): Promise<
    {
      id: string;
      courseOrProgram: string;
      issuedAt: Date;
      certificateHash: string;
      downloadUrl: string;
    }[]
  > {
    const certs = await this.certificateRepository.find({
      where: { user: { id: userId } },
      order: { issuedAt: 'DESC' },
    });

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    return certs.map((c) => ({
      id: c.id,
      courseOrProgram: c.courseOrProgram,
      issuedAt: c.issuedAt,
      certificateHash: c.certificateHash,
      downloadUrl: `${baseUrl}/api/v1/certificates/${c.id}/download`,
    }));
  }

  async verifyCertificateByHash(hash: string): Promise<{
    valid: boolean;
    recipientName?: string;
    courseOrProgram?: string;
    issuedAt?: Date;
  }> {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateHash: hash },
    });

    if (!certificate || !certificate.isValid) {
      return { valid: false };
    }

    if (certificate.expiresAt && new Date() > certificate.expiresAt) {
      return { valid: false };
    }

    return {
      valid: true,
      recipientName: certificate.recipientName ?? 'Valued Student',
      courseOrProgram: certificate.courseOrProgram,
      issuedAt: certificate.issuedAt,
    };
  }

  async getCertificateForDownload(
    certificateId: string,
    requestingUserId: string,
  ): Promise<string> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId },
      relations: ['user'],
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.user.id !== requestingUserId) {
      throw new ForbiddenException(
        'You are not allowed to download this certificate',
      );
    }

    if (!certificate.certificatePath) {
      const pdfPath = await this.generatePdf(certificate);
      certificate.certificatePath = pdfPath;
      await this.certificateRepository.save(certificate);
    }

    if (!fs.existsSync(certificate.certificatePath)) {
      const pdfPath = await this.generatePdf(certificate);
      certificate.certificatePath = pdfPath;
      await this.certificateRepository.save(certificate);
    }

    return certificate.certificatePath;
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
