import { PrismaClient } from '@prisma/client';
import {
  PERMISSION_REGISTRY,
  PERMISSION_REGISTRY_VERSION,
  DEFAULT_PLATFORM_ROLE_GRANTS,
  DEFAULT_TENANT_ROLE_GRANTS,
} from '../src/common/security/permission-registry';

const prisma = new PrismaClient();

async function main() {
  console.log(`[RBAC Sync] Starting synchronization (Registry Version: ${PERMISSION_REGISTRY_VERSION})...`);

  let permissionsAdded = 0;
  let permissionsUpdated = 0;
  let platformGrantsCreated = 0;
  let tenantRolesInitialized = 0;
  let tenantGrantsCreated = 0;

  // 1. Sync Permission definitions
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

  // Load all synchronized permissions into a code map
  const dbPermissions = await prisma.permission.findMany();
  const permMapByCode = new Map(dbPermissions.map((p) => [p.code, p]));

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

    for (const pCode of grantCodes) {
      const perm = permMapByCode.get(pCode);
      if (!perm) continue;

      const existingGrant = await prisma.platformRolePermission.findUnique({
        where: {
          platformRoleId_permissionId: {
            platformRoleId: platformRole.id,
            permissionId: perm.id,
          },
        },
      });

      if (!existingGrant) {
        await prisma.platformRolePermission.create({
          data: {
            platformRoleId: platformRole.id,
            permissionId: perm.id,
          },
        });
        platformGrantsCreated++;
      }
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
      }

      // Bootstrap grants if default un-customized state
      for (const pCode of grantCodes) {
        const perm = permMapByCode.get(pCode);
        if (!perm) continue;

        const existingGrant = await prisma.tenantRolePermission.findUnique({
          where: {
            tenantRoleId_permissionId: {
              tenantRoleId: tenantRole.id,
              permissionId: perm.id,
            },
          },
        });

        if (!existingGrant) {
          await prisma.tenantRolePermission.create({
            data: {
              tenantRoleId: tenantRole.id,
              permissionId: perm.id,
            },
          });
          tenantGrantsCreated++;
        }
      }
    }
  }

  console.log(`[RBAC Sync] Completed successfully.`);
  console.log(`  - Permissions Created: ${permissionsAdded}`);
  console.log(`  - Permissions Updated: ${permissionsUpdated}`);
  console.log(`  - Platform Grants Created: ${platformGrantsCreated}`);
  console.log(`  - Tenants Scanned: ${tenants.length}`);
  console.log(`  - Tenant Roles Initialized: ${tenantRolesInitialized}`);
  console.log(`  - Tenant Grants Created: ${tenantGrantsCreated}`);
}

main()
  .catch((e) => {
    console.error('[RBAC Sync Failed]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
