import { Module } from "@nestjs/common";
import { PersistenceModule } from "../persistence/persistence.module";
import { MasterCoreModule } from "../platform/masters/master-core.module";
import { CrmController } from "./crm.controller";
import { CrmRepository } from "./crm.repository";
import { CrmService } from "./crm.service";
@Module({
  imports: [PersistenceModule, MasterCoreModule],
  controllers: [CrmController],
  providers: [CrmRepository, CrmService],
})
export class CrmModule {}
