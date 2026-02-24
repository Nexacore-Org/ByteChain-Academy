import { Test, TestingModule } from '@nestjs/testing';
import { CertificateController } from './certificates.controller';
import { CertificateService } from './certificates.service';

describe('CertificateController', () => {
  let controller: CertificateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateController],
      providers: [
        { provide: CertificateService, useValue: { verifyCertificate: jest.fn(), getAllCertificates: jest.fn(), revokeCertificate: jest.fn() } },
      ],
    }).compile();

    controller = module.get<CertificateController>(CertificateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
