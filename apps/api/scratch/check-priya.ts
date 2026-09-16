import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const tenants = await prisma.tenant.findMany({
    include: {
      roles: true,
      memberships: {
        include: {
          user: { select: { email: true, fullName: true } },
          tenantRole: { select: { code: true, name: true } },
        },
      },
    },
  });
  console.log('TENANTS:', JSON.stringify(tenants, null, 2));
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
