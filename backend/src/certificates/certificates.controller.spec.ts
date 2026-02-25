import { Test, TestingModule } from '@nestjs/testing';
import { CertificateController } from './certificates.controller';
import { CertificateService } from './certificates.service';

describe('CertificateController', () => {
  let controller: CertificateController;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [CertificateController],
      providers: [
        {
          provide: CertificateService,
          useValue: {
            verifyCertificate: jest.fn(),
            getAllCertificates: jest.fn(),
            getCertificatesByUser: jest.fn(),
            revokeCertificate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = testingModule.get<CertificateController>(CertificateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyCertificates', () => {
    it('should call getCertificatesByUser with the user id from the request', async () => {
      const mockReq = { user: { id: 'user-123' } };
      const mockCertificates = [{ id: 'cert-1' }];
      const service = testingModule.get<CertificateService>(CertificateService);
      (service.getCertificatesByUser as jest.Mock).mockResolvedValue(
        mockCertificates,
      );

      const result = await controller.getMyCertificates(mockReq);

      expect(service.getCertificatesByUser).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockCertificates);
    });
  });
});
