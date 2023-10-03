import { Test, TestingModule } from '@nestjs/testing';
import { CompanyOnboardingController } from './company-onboarding.controller';
import { CompanyOnboardingService } from './company-onboarding.service';

describe('CompanyOnboardingController', () => {
  let controller: CompanyOnboardingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyOnboardingController],
      providers: [CompanyOnboardingService],
    }).compile();

    controller = module.get<CompanyOnboardingController>(CompanyOnboardingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
