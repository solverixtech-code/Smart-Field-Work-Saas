import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistence/persistence.module';
import { SubscriptionTransactionService } from '../subscriptions/subscription-transaction.service';
import { IndustryService } from './industry.service';
import { IndustryAssignmentService } from './industry-assignment.service';
import { IndustryImportService } from './industry-import.service';

// Shared API/CLI composition. No HTTP authentication or unrelated domain bootstrap.
@Module({
  imports: [PersistenceModule],
  providers: [
    SubscriptionTransactionService,
    IndustryService,
    IndustryAssignmentService,
    IndustryImportService,
  ],
  exports: [IndustryService, IndustryAssignmentService, IndustryImportService],
})
export class IndustryCoreModule {}
