import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CertificateService } from './certificates.service';
import { Certificate } from './entities/certificate.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

describe('CertificateService', () => {
  let service: CertificateService;
  let certRepo: ReturnType<typeof makeCertRepo>;
  let userRepo: ReturnType<typeof makeUserRepo>;
  let courseRepo: ReturnType<typeof makeCourseRepo>;
  let notificationsService: { createNotification: jest.Mock };

  beforeEach(async () => {
    certRepo = makeCertRepo();
    userRepo = makeUserRepo();
    courseRepo = makeCourseRepo();
    notificationsService = {
      createNotification: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        { provide: getRepositoryToken(Certificate), useValue: certRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Course), useValue: courseRepo },
        { provide: NotificationsService, useValue: notificationsService },
        {
          provide: EmailService,
          useValue: {
            sendCertificateEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
        },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* -------------------------------------------------------------------------- */
  /*                         getCertificatesByUser                              */
  /* -------------------------------------------------------------------------- */

  describe('getCertificatesByUser', () => {
    it('should return certificates for a user', async () => {
      certRepo.find.mockResolvedValue([mockCertificate]);

      const result = await service.getCertificatesByUser(mockUser.id);

      expect(certRepo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockCertificate.id);
    });

    it('should return an empty array when user has no certificates', async () => {
      certRepo.find.mockResolvedValue([]);

      const result = await service.getCertificatesByUser(mockUser.id);

      expect(result).toHaveLength(0);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                        issueCertificateForCourse                           */
  /* -------------------------------------------------------------------------- */

  describe('issueCertificateForCourse', () => {
    it('should create and return a new certificate on first issuance', async () => {
      certRepo.findOne.mockResolvedValue(null); // no duplicate
      userRepo.findOneBy.mockResolvedValue(mockUser);
      courseRepo.findOneBy.mockResolvedValue(mockCourse);
      certRepo.create.mockReturnValue(mockCertificate);
      certRepo.save.mockResolvedValue(mockCertificate);

      const result = await service.issueCertificateForCourse(
        mockUser.id,
        mockCourse.id,
      );

      expect(certRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id }, course: { id: mockCourse.id } },
      });
      expect(certRepo.create).toHaveBeenCalled();
      expect(certRepo.save).toHaveBeenCalled();
      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        expect.stringContaining(mockCourse.title),
        '/certificates',
      );
      expect(result.id).toBe(mockCertificate.id);
    });

    it('should call sendCertificateEmail with correct pdfPath', async () => {
      const mockEmailService = {
        sendCertificateEmail: jest.fn().mockResolvedValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CertificateService,
          { provide: getRepositoryToken(Certificate), useValue: certRepo },
          { provide: getRepositoryToken(User), useValue: userRepo },
          { provide: getRepositoryToken(Course), useValue: courseRepo },
          { provide: NotificationsService, useValue: notificationsService },
          { provide: EmailService, useValue: mockEmailService },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('http://localhost:3000'),
            },
          },
        ],
      }).compile();

      const testService = module.get<CertificateService>(CertificateService);

      certRepo.findOne.mockResolvedValue(null); // no duplicate
      userRepo.findOneBy.mockResolvedValue(mockUser);
      courseRepo.findOneBy.mockResolvedValue(mockCourse);
      certRepo.create.mockReturnValue(mockCertificate);
      certRepo.save.mockResolvedValue(mockCertificate);

      await testService.issueCertificateForCourse(mockUser.id, mockCourse.id);

      expect(mockEmailService.sendCertificateEmail).toHaveBeenCalledWith(
        mockUser.email,
        'Alice',
        mockCourse.title,
        mockCertificate.certificateHash,
        expect.stringContaining('.pdf'), // pdfPath
      );
    });

    it('should return existing certificate without creating a duplicate', async () => {
      certRepo.findOne.mockResolvedValue(mockCertificate);

      const result = await service.issueCertificateForCourse(
        mockUser.id,
        mockCourse.id,
      );

      expect(certRepo.save).not.toHaveBeenCalled();
      expect(result).toBe(mockCertificate);
    });

    it('should throw NotFoundException when user or course is not found', async () => {
      certRepo.findOne.mockResolvedValue(null);
      userRepo.findOneBy.mockResolvedValue(null);
      courseRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.issueCertificateForCourse('bad-user', 'bad-course'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                           verifyCertificate                                */
  /* -------------------------------------------------------------------------- */

  describe('verifyCertificate', () => {
    it('should return isValid=true for a valid certificate', async () => {
      certRepo.findOne.mockResolvedValue(mockCertificate);

      const result = await service.verifyCertificate({
        certificateHash: mockCertificate.certificateHash,
      });

      expect(result.isValid).toBe(true);
      expect(result.certificate?.recipientName).toBe(mockUser.name);
    });

    it('should return isValid=false when hash is empty', async () => {
      const result = await service.verifyCertificate({
        certificateHash: '   ',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toMatch(/required/i);
    });

    it('should return isValid=false when certificate is not found', async () => {
      certRepo.findOne.mockResolvedValue(null);

      const result = await service.verifyCertificate({
        certificateHash: 'unknown-hash',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toMatch(/not found/i);
    });

    it('should return isValid=false when certificate has been revoked', async () => {
      certRepo.findOne.mockResolvedValue({
        ...mockCertificate,
        isValid: false,
      });

      const result = await service.verifyCertificate({
        certificateHash: mockCertificate.certificateHash,
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toMatch(/invalid|revoked/i);
    });

    it('should return isValid=false when certificate has expired', async () => {
      const pastDate = new Date('2000-01-01');
      certRepo.findOne.mockResolvedValue({
        ...mockCertificate,
        expiresAt: pastDate,
      });

      const result = await service.verifyCertificate({
        certificateHash: mockCertificate.certificateHash,
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toMatch(/expir/i);
    });

    it('should return isValid=true for a cert with a future expiry date', async () => {
      const futureDate = new Date('2099-12-31');
      certRepo.findOne.mockResolvedValue({
        ...mockCertificate,
        expiresAt: futureDate,
      });

      const result = await service.verifyCertificate({
        certificateHash: mockCertificate.certificateHash,
      });

      expect(result.isValid).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                            revokeCertificate                               */
  /* -------------------------------------------------------------------------- */

  describe('revokeCertificate', () => {
    it('should set isValid=false and save the certificate', async () => {
      const cert = { ...mockCertificate, isValid: true };
      certRepo.findOne.mockResolvedValue(cert);
      certRepo.save.mockResolvedValue({ ...cert, isValid: false });

      const result = await service.revokeCertificate(cert.id);

      expect(cert.isValid).toBe(false);
      expect(certRepo.save).toHaveBeenCalledWith(cert);
      expect(result.message).toMatch(/revoked/i);
      expect(result.certificateId).toBe(cert.id);
    });

    it('should throw NotFoundException when certificate does not exist', async () => {
      certRepo.findOne.mockResolvedValue(null);

      await expect(service.revokeCertificate('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
