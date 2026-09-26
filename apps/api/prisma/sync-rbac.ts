import { PrismaClient } from '@prisma/client';
import { syncCrmAdministratorGrants } from './sync-crm-grants';
import {
  PERMISSION_REGISTRY,
  PERMISSION_REGISTRY_VERSION,
  DEFAULT_PLATFORM_ROLE_GRANTS,
  DEFAULT_TENANT_ROLE_GRANTS,
} from '../src/common/security/permission-registry';

const defaultPrisma = new PrismaClient();

export async function syncRbac(client?: PrismaClient) {
  const prisma = client || defaultPrisma;
  console.log(`[RBAC Sync] Starting synchronization (Registry Version: ${PERMISSION_REGISTRY_VERSION})...`);

  let permissionsAdded = 0;
  let permissionsUpdated = 0;
  let permissionsInactivated = 0;
  let platformGrantsCreated = 0;
  let tenantRolesInitialized = 0;
  let tenantGrantsCreated = 0;

  // 1. Sync Permission definitions from registry
  for (const def of PERMISSION_REGISTRY) {
    const existing = await prisma.permission.findFirst({
      where: {
        OR: [
          { code: def.code },
          { moduleKey: def.moduleKey, action: def.action },
        ],
      },
    });

    if (existing) {
      await prisma.permission.update({
        where: { id: existing.id },
        data: {
          code: def.code,
          scope: def.scope,
          domain: def.domain,
          resource: def.resource,
          moduleKey: def.moduleKey,
          action: def.action,
          description: def.description,
          isActive: true,
          registryVersion: PERMISSION_REGISTRY_VERSION,
        },
      });
      permissionsUpdated++;
    } else {
      await prisma.permission.create({
        data: {
          code: def.code,
          scope: def.scope,
          domain: def.domain,
          resource: def.resource,
          moduleKey: def.moduleKey,
          action: def.action,
          description: def.description,
          isActive: true,
          registryVersion: PERMISSION_REGISTRY_VERSION,
        },
      });
      permissionsAdded++;
    }
  }

  // 1b. Mark permissions missing from developer registry as isActive = false
  // AND transactionally bump permissionsVersion for all affected PlatformRoles and TenantRoles
  const registryCodes = new Set(PERMISSION_REGISTRY.map((p) => p.code));
  const activeDbPermissions = await prisma.permission.findMany({
    where: { isActive: true },
  });

  for (const p of activeDbPermissions) {
    if (p.code && !registryCodes.has(p.code)) {
      const affectedPlatformGrants = await prisma.platformRolePermission.findMany({
        where: { permissionId: p.id },
        select: { platformRoleId: true },
      });
      const affectedPlatformRoleIds = Array.from(
        new Set(affectedPlatformGrants.map((g) => g.platformRoleId)),
      );

      const affectedTenantGrants = await prisma.tenantRolePermission.findMany({
        where: { permissionId: p.id },
        select: { tenantRoleId: true },
      });
      const affectedTenantRoleIds = Array.from(
        new Set(affectedTenantGrants.map((g) => g.tenantRoleId)),
      );

      await prisma.$transaction(async (tx) => {
        await tx.permission.update({
          where: { id: p.id },
          data: { isActive: false },
        });

        if (affectedPlatformRoleIds.length > 0) {
          await tx.platformRole.updateMany({
            where: { id: { in: affectedPlatformRoleIds } },
            data: { permissionsVersion: { increment: 1 } },
          });
        }

        if (affectedTenantRoleIds.length > 0) {
          await tx.tenantRole.updateMany({
            where: { id: { in: affectedTenantRoleIds } },
            data: { permissionsVersion: { increment: 1 } },
          });
        }
      });

      permissionsInactivated++;
    }
  }

  // Load all active synchronized permissions into a code map
  const dbPermissions = await prisma.permission.findMany({ where: { isActive: true } });
  const permMapByCode = new Map(dbPermissions.filter((p) => p.code !== null).map((p) => [p.code!, p]));

  // 2. Sync Built-in Platform Roles & PlatformRolePermissions
  const platformRoleNames: Record<string, string> = {
    PLATFORM_SUPER_ADMIN: 'Platform Super Admin',
    PLATFORM_OPERATIONS_ADMIN: 'Platform Operations Admin',
    PLATFORM_ONBOARDING: 'Platform Onboarding Manager',
    PLATFORM_SUPPORT: 'Platform Support Lead',
    PLATFORM_BILLING: 'Platform Billing Specialist',
    PLATFORM_AUDITOR: 'Platform Auditor',
  };

  for (const [code, grantCodes] of Object.entries(DEFAULT_PLATFORM_ROLE_GRANTS)) {
    const platformRole = await prisma.platformRole.upsert({
      where: { code },
      update: {
        name: platformRoleNames[code] ?? code,
        isActive: true,
      },
      create: {
        code,
        name: platformRoleNames[code] ?? code,
        isSystem: true,
        isActive: true,
        permissionsVersion: 1,
      },
    });

    const desiredPermIds = new Set<string>();
    for (const pCode of grantCodes) {
      const perm = permMapByCode.get(pCode);
      if (perm && perm.scope === 'PLATFORM') {
        desiredPermIds.add(perm.id);
      }
    }

    const existingGrants = await prisma.platformRolePermission.findMany({
      where: { platformRoleId: platformRole.id },
      select: { permissionId: true },
    });
    const existingPermIds = new Set(existingGrants.map((g) => g.permissionId));

    const missingPermIds = Array.from(desiredPermIds).filter((id) => !existingPermIds.has(id));
    const obsoletePermIds = Array.from(existingPermIds).filter((id) => !desiredPermIds.has(id));

    if (missingPermIds.length > 0 || obsoletePermIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        if (missingPermIds.length > 0) {
          for (const permissionId of missingPermIds) {
            await tx.platformRolePermission.upsert({
              where: {
                platformRoleId_permissionId: {
                  platformRoleId: platformRole.id,
                  permissionId,
                },
              },
              update: {},
              create: {
                platformRoleId: platformRole.id,
                permissionId,
              },
            });
          }
        }
        if (obsoletePermIds.length > 0) {
          await tx.platformRolePermission.deleteMany({
            where: {
              platformRoleId: platformRole.id,
              permissionId: { in: obsoletePermIds },
            },
          });
        }
        await tx.platformRole.update({
          where: { id: platformRole.id },
          data: { permissionsVersion: { increment: 1 } },
        });
      });
      platformGrantsCreated += missingPermIds.length;
    }
  }

  // 3. Sync Built-in Tenant Roles for all Tenants
  const tenants = await prisma.tenant.findMany({ select: { id: true } });
  const tenantRoleNames: Record<string, string> = {
    tenant_admin: 'Workspace Administrator',
    sales_manager: 'Sales Manager',
    team_leader: 'Team Leader',
    field_executive: 'Field Executive',
    finance_ops: 'Finance & Payroll Operations',
    support: 'Support Specialist',
  };

  for (const tenant of tenants) {
    for (const [roleCode, grantCodes] of Object.entries(DEFAULT_TENANT_ROLE_GRANTS)) {
      let tenantRole = await prisma.tenantRole.findUnique({
        where: {
          tenantId_code: {
            tenantId: tenant.id,
            code: roleCode,
          },
        },
      });

      let isNewRole = false;
      if (!tenantRole) {
        tenantRole = await prisma.tenantRole.create({
          data: {
            tenantId: tenant.id,
            code: roleCode,
            name: tenantRoleNames[roleCode] ?? roleCode,
            isSystem: true,
            isActive: true,
            permissionsVersion: 1,
          },
        });
        tenantRolesInitialized++;
        isNewRole = true;
      }

      const activeRole = tenantRole;

      // Safe guard: do not rewrite customized non-admin roles. Mandatory self-service
      // permissions remain additive so existing executive roles can use newly deployed APIs.
      const isCustomizedRole = roleCode !== 'tenant_admin' && !isNewRole && activeRole.permissionsVersion > 1;
      const effectiveGrantCodes = isCustomizedRole
        ? roleCode === 'field_executive' ? ['crm.location.track'] : []
        : grantCodes;
      if (!effectiveGrantCodes.length) continue;

      const missingPermIds: string[] = [];
      for (const pCode of effectiveGrantCodes) {
        const perm = permMapByCode.get(pCode);
        if (!perm || perm.scope !== 'TENANT') continue;

        const existingGrant = await prisma.tenantRolePermission.findUnique({
          where: {
            tenantRoleId_permissionId: {
              tenantRoleId: activeRole.id,
              permissionId: perm.id,
            },
          },
        });

        if (!existingGrant) {
          missingPermIds.push(perm.id);
        }
      }

      if (missingPermIds.length > 0) {
        const roleId = activeRole.id;
        await prisma.$transaction(async (tx) => {
          for (const permissionId of missingPermIds) {
            await tx.tenantRolePermission.upsert({
              where: {
                tenantRoleId_permissionId: {
                  tenantRoleId: roleId,
                  permissionId,
                },
              },
              update: {},
              create: {
                tenantRoleId: roleId,
                permissionId,
              },
            });
          }
          await tx.tenantRole.update({
            where: { id: roleId },
            data: { permissionsVersion: { increment: 1 } },
          });
        });
        tenantGrantsCreated += missingPermIds.length;
      }
    }
  }

  const crm = await syncCrmAdministratorGrants(prisma);
  tenantGrantsCreated += crm.added;
  console.log(`[RBAC Sync] Completed successfully.`);
  console.log(`  - Permissions Created: ${permissionsAdded}`);
  console.log(`  - Permissions Updated: ${permissionsUpdated}`);
  console.log(`  - Permissions Inactivated: ${permissionsInactivated}`);
  console.log(`  - Platform Grants Created: ${platformGrantsCreated}`);
  console.log(`  - Tenants Scanned: ${tenants.length}`);
  console.log(`  - Tenant Roles Initialized: ${tenantRolesInitialized}`);
  console.log(`  - Tenant Grants Created: ${tenantGrantsCreated}`);
}

if (require.main === module) {
  syncRbac()
    .catch((e) => {
      console.error('[RBAC Sync Failed]:', e);
      process.exit(1);
    })
    .finally(async () => {
      await defaultPrisma.$disconnect();
    });
}
