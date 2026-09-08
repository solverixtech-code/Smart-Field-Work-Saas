import { Module } from "@nestjs/common";
import { MasterCoreModule } from "../platform/masters/master-core.module";
import { RuntimeClock, RuntimeConfigCache } from "./runtime-cache.service";
import { RuntimeConfigService } from "./runtime-config.service";
import { RuntimeController } from "./runtime.controller";

@Module({
  imports: [MasterCoreModule],
  providers: [RuntimeClock, RuntimeConfigCache, RuntimeConfigService],
  controllers: [RuntimeController],
})
export class RuntimeModule {}
