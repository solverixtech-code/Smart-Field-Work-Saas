import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PlatformModulesController } from './platform-modules.controller';
import { PlatformModulesService } from './platform-modules.service';
import { PlatformCatalogSyncService } from './platform-catalog-sync.service';

@Module({
  imports: [AuthModule],
  controllers: [PlatformModulesController],
  providers: [PlatformModulesService, PlatformCatalogSyncService],
  exports: [PlatformModulesService, PlatformCatalogSyncService],
})
export class PlatformModulesModule {}
