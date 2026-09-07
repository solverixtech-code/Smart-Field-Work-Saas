import { Module } from "@nestjs/common";
import { PersistenceModule } from "../../persistence/persistence.module";
import { EffectivePermissionService } from "../../common/security/effective-permission.service";
import { PermissionCacheService } from "../../common/security/permission-cache.service";
import { SubscriptionTransactionService } from "../subscriptions/subscription-transaction.service";
import { MasterTransactionService } from "./master-transaction.service";
import { EffectiveMasterService } from "./effective-master.service";
import { MasterService } from "./master.service";
import { MasterSeedService } from "./master-seed.service";
import { MasterReconciliationService } from "./master-reconciliation.service";

@Module({
  imports: [PersistenceModule],
  providers: [
    SubscriptionTransactionService,
    MasterTransactionService,
    EffectiveMasterService,
    MasterService,
    MasterSeedService,
    MasterReconciliationService,
    EffectivePermissionService,
    PermissionCacheService,
  ],
  exports: [
    MasterService,
    EffectiveMasterService,
    MasterSeedService,
    MasterReconciliationService,
  ],
})
export class MasterCoreModule {}
