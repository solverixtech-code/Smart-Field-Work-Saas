import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MasterIntegrityInterceptor } from "./master-integrity.interceptor";
import { MasterCoreModule } from "./master-core.module";
import {
  PlatformMasterController,
  TenantMasterController,
} from "./master.controller";

@Module({
  imports: [MasterCoreModule],
  controllers: [PlatformMasterController, TenantMasterController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: MasterIntegrityInterceptor },
  ],
})
export class PlatformMastersModule {}
