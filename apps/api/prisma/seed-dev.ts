import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';
import { PrismaService } from '../src/persistence/prisma.service';
import { seedPermissions } from './seeds/system-permissions';
import { seedPlatformRoles } from './seeds/platform-roles';
import { seedTenantRoleTemplates } from './seeds/tenant-role-templates';
import { syncRbac } from './sync-rbac';

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
  await syncRbac(prisma);
  console.log('✅ System permissions, platform roles, tenant templates & canonical RBAC seeded.');

  // 3. Seed development demo users
  const defaultPassword = await argon2.hash('Solverix@2025');

  const users = [
    {
      employeeCode: 'SOL-SA-001',
      fullName: 'Amit Sharma',
      email: 'amit.sharma@solverixtech.com',
      role: Role.SUPER_ADMIN,
      mobile: '+919876543210',
    },
    {
      employeeCode: 'SOL-ADM-001',
      fullName: 'Priya Mehta',
      email: 'priya.mehta@solverixtech.com',
      role: Role.ADMIN,
      mobile: '+919876543211',
    },
    {
      employeeCode: 'SOL-SM-001',
      fullName: 'Ravi Kumar',
      email: 'ravi.kumar@solverixtech.com',
      role: Role.SALES_MANAGER,
      mobile: '+919876543212',
    },
    {
      employeeCode: 'SOL-TL-001',
      fullName: 'Sneha Iyer',
      email: 'sneha.iyer@solverixtech.com',
      role: Role.TEAM_LEADER,
      mobile: '+919876543213',
    },
    {
      employeeCode: 'SOL-FE-001',
      fullName: 'Vikram Singh',
      email: 'vikram.singh@solverixtech.com',
      role: Role.FIELD_EXECUTIVE,
      mobile: '+919876543214',
    },
    {
      employeeCode: 'SOL-FE-002',
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@solverixtech.com',
      role: Role.FIELD_EXECUTIVE,
      mobile: '+919876543216',
    },
    {
      employeeCode: 'SOL-FE-003',
      fullName: 'Deepak Patel',
      email: 'deepak.patel@solverixtech.com',
      role: Role.FIELD_EXECUTIVE,
      mobile: '+919876543217',
    },
    {
      employeeCode: 'SOL-FO-001',
      fullName: 'Sunita Patel',
      email: 'sunita.patel@solverixtech.com',
      role: Role.FINANCE_OPS,
      mobile: '+919876543218',
    },
    {
      employeeCode: 'SOL-SP-001',
      fullName: 'Neha Gupta',
      email: 'neha.gupta@solverixtech.com',
      role: Role.SUPPORT,
      mobile: '+919876543215',
    },
    {
      employeeCode: 'PLAT-SA-001',
      fullName: 'Sahibjit Singh',
      email: 'platform.admin@solverixtech.com',
      role: Role.PLATFORM_SUPER_ADMIN,
      mobile: '+919900000001',
    },
    {
      employeeCode: 'PLAT-OPS-001',
      fullName: 'Rajesh Operations',
      email: 'platform.ops@solverixtech.com',
      role: Role.PLATFORM_OPERATIONS_ADMIN,
      mobile: '+919900000002',
    },
    {
      employeeCode: 'PLAT-ONB-001',
      fullName: 'Neha Onboarding',
      email: 'platform.onboarding@solverixtech.com',
      role: Role.PLATFORM_ONBOARDING,
      mobile: '+919900000003',
    },
    {
      employeeCode: 'PLAT-SUP-001',
      fullName: 'Support Helpdesk',
      email: 'platform.support@solverixtech.com',
      role: Role.PLATFORM_SUPPORT,
      mobile: '+919900000004',
    },
    {
      employeeCode: 'PLAT-BIL-001',
      fullName: 'Finance Billing',
      email: 'platform.billing@solverixtech.com',
      role: Role.PLATFORM_BILLING,
      mobile: '+919900000005',
    },
    {
      employeeCode: 'PLAT-AUD-001',
      fullName: 'Audit Compliance',
      email: 'platform.auditor@solverixtech.com',
      role: Role.PLATFORM_AUDITOR,
      mobile: '+919900000006',
    },
  ];

  for (const u of users) {
    const existingByCode = await prisma.user.findUnique({
      where: { employeeCode: u.employeeCode },
    });
    const existingByEmail = await prisma.user.findUnique({
      where: { email: u.email },
    });

    let user;
    if (existingByCode) {
      user = await prisma.user.update({
        where: { id: existingByCode.id },
        data: {
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          mobile: u.mobile,
          passwordHash: defaultPassword,
        },
      });
    } else if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          employeeCode: u.employeeCode,
          fullName: u.fullName,
          role: u.role,
          mobile: u.mobile,
          passwordHash: defaultPassword,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          employeeCode: u.employeeCode,
          fullName: u.fullName,
          email: u.email,
          passwordHash: defaultPassword,
          role: u.role,
          mobile: u.mobile,
        },
      });
    }

    if (String(u.role).startsWith('PLATFORM_')) {
      const platformRole = await prisma.platformRole.findUnique({
        where: { code: u.role },
      });
      if (platformRole) {
        await prisma.platformUserRoleAssignment.upsert({
          where: {
            userId_platformRoleId: {
              userId: user.id,
              platformRoleId: platformRole.id,
            },
          },
          update: { status: 'ACTIVE' },
          create: {
            userId: user.id,
            platformRoleId: platformRole.id,
            status: 'ACTIVE',
          },
        });
      }
    } else {
      // Reconcile/update legacy demo tenants if present
      await prisma.tenant.updateMany({
        where: {
          OR: [
            { slug: 'visiblo-crm-demo' },
            { displayName: { contains: 'Visiblo' } },
            { legalName: { contains: 'Visiblo' } },
          ],
        },
        data: {
          slug: 'solverix-tech-demo',
          displayName: 'Solverix Smart Field Work',
          legalName: 'Solverix Technologies Pvt. Ltd.',
        },
      });

      let demoTenants = await prisma.tenant.findMany({
        where: { status: 'ACTIVE' },
        include: { roles: true },
      });

      if (demoTenants.length === 0) {
        console.log('📌 No active demo tenant found. Creating Solverix Technologies Demo Tenant...');
        await prisma.tenant.create({
          data: {
            slug: 'solverix-tech-demo',
            displayName: 'Solverix Smart Field Work',
            legalName: 'Solverix Technologies Pvt. Ltd.',
            status: 'ACTIVE',
          },
        });
        await syncRbac(prisma);
        demoTenants = await prisma.tenant.findMany({
          where: { status: 'ACTIVE' },
          include: { roles: true },
        });
      }

      for (const tenant of demoTenants) {
        const sub = await prisma.tenantSubscription.findUnique({
          where: { tenantId: tenant.id },
        });
        if (sub && sub.seatQuantity < 500) {
          const nextRevision = sub.revision + 1;
          await prisma.$transaction(async (tx) => {
            await tx.subscriptionChange.create({
              data: {
                subscriptionId: sub.id,
                tenantId: tenant.id,
                idempotencyKey: `seed-seats-${sub.id}-${Date.now()}`,
                payloadHash: 'seed-hash',
                kind: 'ADD_SEATS',
                reason: 'Dev Seed Seat Increase',
                fromPlanVersionId: sub.planVersionId,
                toPlanVersionId: sub.planVersionId,
                fromStatus: sub.status,
                toStatus: sub.status,
                status: 'APPLIED',
                effectiveAt: new Date(),
                appliedAt: new Date(),
                actorUserId: user.id,
                revision: nextRevision,
                requestData: {},
                result: {},
              },
            });
            await tx.tenantSubscription.update({
              where: { id: sub.id },
              data: {
                seatQuantity: 500,
                revision: nextRevision,
              },
            });
          });
        }
      }
      const roleCodeMap: Record<string, string> = {
        SUPER_ADMIN: 'tenant_admin',
        ADMIN: 'tenant_admin',
        SALES_MANAGER: 'sales_manager',
        TEAM_LEADER: 'team_leader',
        FIELD_EXECUTIVE: 'field_executive',
        FINANCE_OPS: 'finance_ops',
        SUPPORT: 'support',
      };
      const targetCode = roleCodeMap[u.role] || 'field_executive';

      for (const demoTenant of demoTenants) {
        const tenantRole =
          demoTenant.roles.find((r) => r.code === targetCode) ||
          demoTenant.roles.find((r) => r.code === 'tenant_admin');
        if (tenantRole) {
          await prisma.tenantMembership.upsert({
            where: {
              tenantId_userId: {
                tenantId: demoTenant.id,
                userId: user.id,
              },
            },
            update: {
              tenantRoleId: tenantRole.id,
              status: 'ACTIVE',
            },
            create: {
              tenantId: demoTenant.id,
              userId: user.id,
              tenantRoleId: tenantRole.id,
              status: 'ACTIVE',
              dataScope: 'ALL',
            },
          });
        }
      }
    }
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
