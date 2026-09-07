import { Module } from '@nestjs/common';
import { PlatformSubscriptionsModule } from '../subscriptions/platform-subscriptions.module';
import { IndustryService } from './industry.service';
import { IndustryAssignmentService } from './industry-assignment.service';
import { IndustryImportService } from './industry-import.service';
import {
  IndustryController,
  PlatformIndustryAssignmentController,
  TenantIndustryAssignmentController,
} from './industry.controller';

@Module({
  imports: [PlatformSubscriptionsModule],
  providers: [
    IndustryService,
    IndustryAssignmentService,
    IndustryImportService,
  ],
  controllers: [
    IndustryController,
    PlatformIndustryAssignmentController,
    TenantIndustryAssignmentController,
  ],
  exports: [IndustryService, IndustryAssignmentService, IndustryImportService],
})
export class PlatformIndustriesModule {}
