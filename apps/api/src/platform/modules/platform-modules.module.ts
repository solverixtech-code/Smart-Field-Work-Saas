import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PlatformModulesController } from './platform-modules.controller';
import { PlatformModulesService } from './platform-modules.service';

@Module({
  imports: [AuthModule],
  controllers: [PlatformModulesController],
  providers: [PlatformModulesService],
  exports: [PlatformModulesService],
})
export class PlatformModulesModule {}
