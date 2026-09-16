import { LeadService } from "./lead.service";
import { LeadController } from "./lead.controller";
import { Module } from "@nestjs/common";
import { PersistenceModule } from "../persistence/persistence.module";
import { MasterCoreModule } from "../platform/masters/master-core.module";
import { CrmController } from "./crm.controller";
import { CrmRepository } from "./crm.repository";
import { CrmService } from "./crm.service";
@Module({
  imports: [PersistenceModule, MasterCoreModule],
  controllers: [CrmController, LeadController],
  providers: [CrmRepository, CrmService, LeadService],
})
export class CrmModule {}
