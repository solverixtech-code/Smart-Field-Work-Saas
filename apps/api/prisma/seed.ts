import { PrismaClient, Role } from '@prisma/client';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';
import { PrismaService } from '../src/persistence/prisma.service';

const prisma = new PrismaClient();
const prismaService = new PrismaService();
const catalogSyncService = new PlatformCatalogSyncService(prismaService);

export const DEFAULT_SYSTEM_PERMISSIONS = [
  { moduleKey: 'platform.dashboard', action: 'view', description: 'View Platform Dashboard' },
  { moduleKey: 'platform.tenants', action: 'view', description: 'View Tenants' },
  { moduleKey: 'platform.tenants', action: 'create', description: 'Create Tenants' },
  { moduleKey: 'platform.tenants', action: 'update', description: 'Update Tenants' },
  { moduleKey: 'platform.tenants', action: 'provision', description: 'Provision Tenants' },
  { moduleKey: 'platform.tenants', action: 'suspend', description: 'Suspend Tenants' },
  { moduleKey: 'platform.tenants.members', action: 'manage', description: 'Manage Tenant Members' },
  { moduleKey: 'platform.tenants.modules', action: 'manage', description: 'Manage Tenant Modules' },
  { moduleKey: 'platform.plans', action: 'view', description: 'View Plans' },
  { moduleKey: 'platform.plans', action: 'create', description: 'Create Plans' },
  { moduleKey: 'platform.plans', action: 'update', description: 'Update Plans' },
  { moduleKey: 'platform.plans', action: 'publish', description: 'Publish Plans' },
  { moduleKey: 'platform.plans', action: 'archive', description: 'Archive Plans' },
  { moduleKey: 'platform.modules', action: 'view', description: 'View Platform Modules' },
  { moduleKey: 'platform.modules', action: 'update', description: 'Update Platform Modules' },
  { moduleKey: 'platform.modules', action: 'archive', description: 'Archive Platform Modules' },
  { moduleKey: 'platform.industries', action: 'view', description: 'View Industries' },
  { moduleKey: 'platform.users', action: 'view', description: 'View Platform Users' },
  { moduleKey: 'platform.roles', action: 'view', description: 'View Platform Roles' },
  { moduleKey: 'platform.subscriptions', action: 'view', description: 'View Subscriptions' },
  { moduleKey: 'platform.subscriptions', action: 'manage', description: 'Manage Subscriptions' },
  { moduleKey: 'platform.billing', action: 'view', description: 'View Billing' },
  { moduleKey: 'platform.users', action: 'manage', description: 'Manage Users' },
  { moduleKey: 'platform.audit', action: 'view', description: 'View Audit Logs' },
];

export async function seedPermissions(client: PrismaClient) {
  for (const perm of DEFAULT_SYSTEM_PERMISSIONS) {
    const dbPerm = await client.permission.upsert({
      where: {
        moduleKey_action: {
          moduleKey: perm.moduleKey,
          action: perm.action,
        },
      },
      update: { description: perm.description },
      create: {
        moduleKey: perm.moduleKey,
        action: perm.action,
        description: perm.description,
      },
    });

    // Grant all platform permissions to SUPER_ADMIN & PLATFORM_SUPER_ADMIN roles
    for (const role of [Role.SUPER_ADMIN, Role.PLATFORM_SUPER_ADMIN]) {
      await client.rolePermission.upsert({
        where: {
          role_permissionId: {
            role,
            permissionId: dbPerm.id,
          },
        },
        update: {},
        create: {
          role,
          permissionId: dbPerm.id,
        },
      });
    }
  }
}

async function main() {
  console.log('🌱 Starting production seed...');

  // 1. Synchronize Platform Module & Feature Catalog from code registry
  console.log('📦 Synchronizing developer-owned platform capability catalog...');
  const health = await catalogSyncService.syncCatalog();
  console.log(`✅ Catalog synchronization complete. Status: ${health.status}, Registry Hash: ${health.registryHash}`);

  // 2. Ensure deterministic system permissions are seeded
  console.log('🔒 Verifying system permissions...');
  await seedPermissions(prisma);
  console.log('✅ System permissions seeded deterministically.');

  console.log('🚀 Production seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Production seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await prismaService.$disconnect();
  });
