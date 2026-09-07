import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistence/persistence.module';
import { PlatformTenantsModule } from '../tenants/platform-tenants.module';
import { SubscriptionPolicyService } from './subscription-policy.service';
import { SubscriptionTransactionService } from './subscription-transaction.service';
import { SubscriptionService } from './subscription.service';
import { ProvisioningService } from './provisioning.service';
import { ProvisioningEventService } from './provisioning-event.service';
import { OwnerInvitationController, PlatformSubscriptionsController } from './platform-subscriptions.controller';
import { SubscriptionReconciliationService } from './subscription-reconciliation.service';

@Module({
  imports: [PersistenceModule, PlatformTenantsModule],
  providers: [SubscriptionPolicyService, SubscriptionTransactionService, SubscriptionService, ProvisioningService, ProvisioningEventService, SubscriptionReconciliationService],
  controllers: [PlatformSubscriptionsController, OwnerInvitationController],
  exports: [SubscriptionService, ProvisioningService, ProvisioningEventService, SubscriptionPolicyService, SubscriptionTransactionService, SubscriptionReconciliationService],
})
export class PlatformSubscriptionsModule {}
