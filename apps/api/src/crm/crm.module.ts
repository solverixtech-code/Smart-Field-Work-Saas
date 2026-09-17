import { Module } from "@nestjs/common";
import { PersistenceModule } from "../persistence/persistence.module";
import { MasterCoreModule } from "../platform/masters/master-core.module";
import { CrmController } from "./crm.controller";
import { CrmRepository } from "./crm.repository";
import { CrmService } from "./crm.service";
import { LeadController } from "./lead.controller";
import { LeadService } from "./lead.service";
import { OpportunityController } from "./opportunity.controller";
import { OpportunityService } from "./opportunity.service";

@Module({
  imports: [PersistenceModule, MasterCoreModule],
  controllers: [CrmController, LeadController, OpportunityController],
  providers: [CrmRepository, CrmService, LeadService, OpportunityService],
  exports: [OpportunityService],
})
export class CrmModule {}
