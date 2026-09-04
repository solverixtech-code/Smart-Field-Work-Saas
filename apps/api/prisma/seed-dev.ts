import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';
import { PrismaService } from '../src/persistence/prisma.service';
import { seedPermissions } from './seeds/system-permissions';
import { seedPlatformRoles } from './seeds/platform-roles';
import { seedTenantRoleTemplates } from './seeds/tenant-role-templates';

const prisma = new PrismaClient();
const prismaService = new PrismaService();
const catalogSyncService = new PlatformCatalogSyncService(prismaService);

async function main() {
  console.log('🌱 Starting development/demo seed...');

  // 1. Sync catalog first
  const health = await catalogSyncService.syncCatalog();
  console.log(`✅ Catalog synchronized. Hash: ${health.registryHash}`);

  // 2. Seed system permissions, platform roles & tenant role templates
  await seedPermissions(prisma);
  await seedPlatformRoles(prisma);
  await seedTenantRoleTemplates(prisma);
  console.log('✅ System permissions, platform roles & tenant role templates seeded.');

  // 3. Seed development demo users
  const defaultPassword = await argon2.hash('Visiblo@2025');

  const users = [
    {
      employeeCode: 'VIS-SA-001',
      fullName: 'Amit Sharma',
      email: 'amit.sharma@visibloai.com',
      role: Role.SUPER_ADMIN,
      mobile: '+919876543210',
    },
    {
      employeeCode: 'VIS-ADM-001',
      fullName: 'Priya Mehta',
      email: 'priya.mehta@visibloai.com',
      role: Role.ADMIN,
      mobile: '+919876543211',
    },
    {
      employeeCode: 'VIS-SM-001',
      fullName: 'Ravi Kumar',
      email: 'ravi.kumar@visibloai.com',
      role: Role.SALES_MANAGER,
      mobile: '+919876543212',
    },
    {
      employeeCode: 'VIS-TL-001',
      fullName: 'Sneha Iyer',
      email: 'sneha.iyer@visibloai.com',
      role: Role.TEAM_LEADER,
      mobile: '+919876543213',
    },
    {
      employeeCode: 'VIS-FO-001',
      fullName: 'Vikram Singh',
      email: 'vikram.singh@visibloai.com',
      role: Role.FINANCE_OPS,
      mobile: '+919876543214',
    },
    {
      employeeCode: 'VIS-SP-001',
      fullName: 'Neha Gupta',
      email: 'neha.gupta@visibloai.com',
      role: Role.SUPPORT,
      mobile: '+919876543215',
    },
    {
      employeeCode: 'PLAT-SA-001',
      fullName: 'Sahibjit Singh',
      email: 'platform.admin@smartfieldwork.com',
      role: Role.PLATFORM_SUPER_ADMIN,
      mobile: '+919900000001',
    },
    {
      employeeCode: 'PLAT-OPS-001',
      fullName: 'Rajesh Operations',
      email: 'platform.ops@smartfieldwork.com',
      role: Role.PLATFORM_OPERATIONS_ADMIN,
      mobile: '+919900000002',
    },
    {
      employeeCode: 'PLAT-ONB-001',
      fullName: 'Neha Onboarding',
      email: 'platform.onboarding@smartfieldwork.com',
      role: Role.PLATFORM_ONBOARDING,
      mobile: '+919900000003',
    },
    {
      employeeCode: 'PLAT-SUP-001',
      fullName: 'Support Helpdesk',
      email: 'platform.support@smartfieldwork.com',
      role: Role.PLATFORM_SUPPORT,
      mobile: '+919900000004',
    },
    {
      employeeCode: 'PLAT-BIL-001',
      fullName: 'Finance Billing',
      email: 'platform.billing@smartfieldwork.com',
      role: Role.PLATFORM_BILLING,
      mobile: '+919900000005',
    },
    {
      employeeCode: 'PLAT-AUD-001',
      fullName: 'Audit Compliance',
      email: 'platform.auditor@smartfieldwork.com',
      role: Role.PLATFORM_AUDITOR,
      mobile: '+919900000006',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        role: u.role,
        mobile: u.mobile,
      },
      create: {
        employeeCode: u.employeeCode,
        fullName: u.fullName,
        email: u.email,
        passwordHash: defaultPassword,
        role: u.role,
        mobile: u.mobile,
      },
    });
  }

  console.log('✅ Development seed complete with demo users.');
}

main()
  .catch((e) => {
    console.error('❌ Dev seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await prismaService.$disconnect();
  });
