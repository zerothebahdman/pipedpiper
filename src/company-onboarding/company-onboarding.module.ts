import { Module } from '@nestjs/common';
import { CompanyOnboardingService } from './company-onboarding.service';
import { CompanyOnboardingController } from './company-onboarding.controller';
import { HelperClass } from 'src/common/services/helper.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { PaginationService } from 'src/common/services/paginate.service';

@Module({
  controllers: [CompanyOnboardingController],
  providers: [
    CompanyOnboardingService,
    HelperClass,
    PrismaService,
    PaginationService,
  ],
})
export class CompanyOnboardingModule {}
