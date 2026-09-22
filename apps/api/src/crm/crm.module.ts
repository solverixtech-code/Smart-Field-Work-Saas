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
import { TerritoryController } from "./territory.controller";
import { TerritoryRepository } from "./territory.repository";
import { TerritoryService } from "./territory.service";
import { FollowUpController } from "./follow-up.controller";
import { FollowUpService } from "./follow-up.service";
import { JobCoreModule } from '../jobs/job-core.module';
import { FieldDashboardController } from "./field-dashboard.controller";
import { FieldDashboardService } from "./field-dashboard.service";
import { VisitController } from "./visit.controller";
import { VisitService } from "./visit.service";

@Module({
  imports: [PersistenceModule, MasterCoreModule, JobCoreModule],
  controllers: [
    CrmController,
    LeadController,
    OpportunityController,
    TerritoryController,
    FollowUpController,
    FieldDashboardController,
    VisitController,
  ],
  providers: [
    CrmRepository,
    CrmService,
    LeadService,
    OpportunityService,
    TerritoryRepository,
    TerritoryService,
    FollowUpService,
    FieldDashboardService,
    VisitService,
  ],
  exports: [OpportunityService, TerritoryService],
})
export class CrmModule {}
