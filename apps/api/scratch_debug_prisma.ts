import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugPrisma() {
  const tenantId = '13e8650b-cf97-453d-8676-60d770d403dc';
  const membershipId = '865df8e9-ca84-4df6-9a5b-cccb8b636d18';

  console.log("=== Testing Prisma Account Query directly ===");
  try {
    const where = {
      AND: [
        {
          tenantId,
          deletedAt: null,
        },
        {
          status: undefined,
          businessTypeValueId: undefined,
          sourceValueId: undefined,
          city: undefined,
          ownerMembershipId: undefined,
        },
      ],
    };

    console.log("Executing tx.account.count...");
    const count = await prisma.account.count({ where });
    console.log("Count success:", count);

    console.log("Executing tx.account.findMany...");
    const rows = await prisma.account.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        name: true,
        businessTypeValueId: true,
        sourceValueId: true,
        categoryLabel: true,
        status: true,
        ownerMembershipId: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        countryCode: true,
        website: true,
        gstin: true,
        establishedYear: true,
        description: true,
        revision: true,
        createdAt: true,
        updatedAt: true,
        ownerMembership: {
          select: {
            id: true,
            user: { select: { fullName: true } },
          },
        },
      },
      skip: 0,
      take: 25,
    });
    console.log("FindMany success, rows count:", rows.length);
  } catch (err: any) {
    console.error("=== RAW PRISMA ERROR ===");
    console.error(err);
    console.error("Error Code:", err.code);
    console.error("Error Message:", err.message);
    console.error("Error Meta:", err.meta);
  }
}

debugPrisma().catch(console.error).finally(() => prisma.$disconnect());
