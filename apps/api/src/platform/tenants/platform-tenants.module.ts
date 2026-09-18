import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistence/persistence.module';
import { TenantService } from './tenant.service';
import { TenantMembershipService } from './tenant-membership.service';
import { TenantRoleService } from './tenant-role.service';
import { MembershipSelectionService } from './membership-selection.service';
import { PlatformRoleService } from './platform-role.service';
import { BackfillPlatformRolesService } from './backfill-platform-roles.service';
import { IdentityCompatibilityService } from './identity-compatibility.service';
import { PlatformTenantsController } from './platform-tenants.controller';
import { TenantRolesController } from './tenant-roles.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [PlatformTenantsController, TenantRolesController],
  providers: [
    TenantService,
    TenantMembershipService,
    TenantRoleService,
    MembershipSelectionService,
    PlatformRoleService,
    BackfillPlatformRolesService,
    IdentityCompatibilityService,
  ],
  exports: [
    TenantService,
    TenantMembershipService,
    TenantRoleService,
    MembershipSelectionService,
    PlatformRoleService,
    BackfillPlatformRolesService,
    IdentityCompatibilityService,
  ],
})
export class PlatformTenantsModule {}
