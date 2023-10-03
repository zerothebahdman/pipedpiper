import { Test, TestingModule } from '@nestjs/testing';
import { CompanyOnboardingService } from './company-onboarding.service';

describe('CompanyOnboardingService', () => {
  let service: CompanyOnboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyOnboardingService],
    }).compile();

    service = module.get<CompanyOnboardingService>(CompanyOnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
