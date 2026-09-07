import { Module } from '@nestjs/common';
import { IndustryCoreModule } from './industry-core.module';
import {
  IndustryController,
  PlatformIndustryAssignmentController,
  TenantIndustryAssignmentController,
} from './industry.controller';

@Module({
  imports: [IndustryCoreModule],
  controllers: [
    IndustryController,
    PlatformIndustryAssignmentController,
    TenantIndustryAssignmentController,
  ],
  exports: [IndustryCoreModule],
})
export class PlatformIndustriesModule {}
