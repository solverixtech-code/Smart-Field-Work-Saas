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
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';
import { IncentiveController } from './incentive.controller';
import { IncentiveService } from './incentive.service';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { LocationTrackingService } from './location-tracking.service';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

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
    TeamController,
    TargetController,
    IncentiveController,
    MapController,
    DemoController,
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
    TeamService,
    TargetService,
    IncentiveService,
    MapService,
    LocationTrackingService,
    DemoService,
  ],
  exports: [OpportunityService, TerritoryService],
})
export class CrmModule {}
