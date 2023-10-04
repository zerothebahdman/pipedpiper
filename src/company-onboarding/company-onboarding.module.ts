import { Module } from '@nestjs/common';
import { CompanyOnboardingService } from './company-onboarding.service';
import { CompanyOnboardingController } from './company-onboarding.controller';
import { HelperClass } from '../common/services/helper.service';
import { PrismaService } from '../common/services/prisma.service';
import { PaginationService } from '../common/services/paginate.service';
import { ImageService } from '../common/services/image.service';

@Module({
  controllers: [CompanyOnboardingController],
  providers: [
    CompanyOnboardingService,
    HelperClass,
    PrismaService,
    PaginationService,
    ImageService,
  ],
})
export class CompanyOnboardingModule {}
