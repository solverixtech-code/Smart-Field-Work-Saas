import { PrismaClient } from '@prisma/client';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';
import { PrismaService } from '../src/persistence/prisma.service';
import { seedPermissions } from './seeds/system-permissions';
import { seedPlatformRoles } from './seeds/platform-roles';
import { seedTenantRoleTemplates } from './seeds/tenant-role-templates';

const prisma = new PrismaClient();
const prismaService = new PrismaService();
const catalogSyncService = new PlatformCatalogSyncService(prismaService);

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

  // 3. Seed Platform Roles & Tenant Role Templates
  console.log('🛡️ Seeding platform roles & tenant role templates...');
  await seedPlatformRoles(prisma);
  await seedTenantRoleTemplates(prisma);
  console.log('✅ Platform roles & tenant role templates seeded.');

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
