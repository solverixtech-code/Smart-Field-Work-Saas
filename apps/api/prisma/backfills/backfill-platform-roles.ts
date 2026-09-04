import { PrismaClient } from '@prisma/client';
import { seedPlatformRoles } from '../seeds/platform-roles';

const prisma = new PrismaClient();

const EXPLICIT_PLATFORM_ROLES = [
  'PLATFORM_SUPER_ADMIN',
  'PLATFORM_OPERATIONS_ADMIN',
  'PLATFORM_ONBOARDING',
  'PLATFORM_SUPPORT',
  'PLATFORM_BILLING',
  'PLATFORM_AUDITOR',
];

async function main() {
  console.log('🛡️ Starting Platform Role Backfill Execution...');

  // 1. Ensure PlatformRole definitions are seeded
  console.log('📦 Verifying PlatformRole seed definitions...');
  await seedPlatformRoles(prisma);
  console.log('✅ PlatformRole definitions verified.');

  // 2. Scan users and backfill PlatformUserRoleAssignments
  console.log('🔍 Scanning Global Users for explicit platform roles...');
  const users = await prisma.user.findMany();

  let usersScanned = 0;
  let explicitPlatformUsers = 0;
  let platformAssignmentsCreated = 0;
  let existingAssignmentsPreserved = 0;
  let legacyTenantUsersDeferred = 0;

  for (const user of users) {
    usersScanned++;

    const roleCode = user.role.toString();
    if (EXPLICIT_PLATFORM_ROLES.includes(roleCode)) {
      explicitPlatformUsers++;

      const role = await prisma.platformRole.findUnique({
        where: { code: roleCode },
      });

      if (!role) {
        console.warn(`⚠️ Warning: PlatformRole '${roleCode}' not found in database.`);
        continue;
      }

      const existing = await prisma.platformUserRoleAssignment.findUnique({
        where: {
          userId_platformRoleId: {
            userId: user.id,
            platformRoleId: role.id,
          },
        },
      });

      if (existing) {
        existingAssignmentsPreserved++;
      } else {
        await prisma.platformUserRoleAssignment.create({
          data: {
            userId: user.id,
            platformRoleId: role.id,
            status: 'ACTIVE',
          },
        });
        platformAssignmentsCreated++;
      }
    } else {
      legacyTenantUsersDeferred++;
    }
  }

  console.log('===================================================');
  console.log('📊 PLATFORM ROLE BACKFILL REPORT');
  console.log('===================================================');
  console.log(`Users Scanned:                 ${usersScanned}`);
  console.log(`Explicit Platform Users:       ${explicitPlatformUsers}`);
  console.log(`Assignments Created:           ${platformAssignmentsCreated}`);
  console.log(`Assignments Preserved:         ${existingAssignmentsPreserved}`);
  console.log(`Legacy Tenant Users Deferred:  ${legacyTenantUsersDeferred}`);
  console.log('===================================================');
  console.log('✅ Platform role backfill completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Platform role backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
