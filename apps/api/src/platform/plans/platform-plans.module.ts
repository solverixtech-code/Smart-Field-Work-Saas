import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistence/persistence.module';
import { AuthSecurityModule } from '../../common/security/auth-security.module';
import { PlatformModulesModule } from '../modules/platform-modules.module';
import { PlatformPlansController } from './platform-plans.controller';
import { PlatformPlansService } from './platform-plans.service';
import { PlanPublicationPolicyService } from './plan-publication-policy.service';
import { PlanQueryService } from './plan-query.service';

@Module({
  imports: [PersistenceModule, AuthSecurityModule, PlatformModulesModule],
  controllers: [PlatformPlansController],
  providers: [PlatformPlansService, PlanPublicationPolicyService, PlanQueryService],
  exports: [PlatformPlansService, PlanPublicationPolicyService, PlanQueryService],
})
export class PlatformPlansModule {}
