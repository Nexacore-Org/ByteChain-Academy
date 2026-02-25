import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CertificateService } from './certificates.service';
import { Certificate } from './entities/certificate.entity';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

const mockRepo = () => ({ findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() });

describe('CertificateService', () => {
  let service: CertificateService;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        { provide: getRepositoryToken(Certificate), useValue: mockRepo() },
        { provide: getRepositoryToken(User), useValue: mockRepo() },
        { provide: getRepositoryToken(Course), useValue: mockRepo() },
      ],
    }).compile();

    service = testingModule.get<CertificateService>(CertificateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCertificatesByUser', () => {
    it('should call certificateRepository.find with user id filter', async () => {
      const userId = 'user-123';
      const mockCertificates = [{ id: 'cert-1' }];
      const repo = (service as any).certificateRepository;
      (repo.find as jest.Mock).mockResolvedValue(mockCertificates);

      const result = await service.getCertificatesByUser(userId);

      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
      });
      expect(result).toBe(mockCertificates);
    });
  });
});
