import { PrismaClient } from '@prisma/client';

describe('Plan Commercial Engine — Database Immutability E2E Test Suite', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:123456@127.0.0.1:5432/visiblo_crm_test?schema=public';
    process.env.DATABASE_URL = testDbUrl;
    prisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should enforce database-level immutability on published PlanVersion and child records', async () => {
    const testCode = `IMMUTABLE_TEST_${Date.now()}`;

    // Get a valid module or create placeholder module
    let coreModule = await prisma.platformModule.findFirst();
    if (!coreModule) {
      coreModule = await prisma.platformModule.create({
        data: {
          code: `test_module_${Date.now()}`,
          name: 'Test Module',
          description: 'Test Module Description',
          status: 'ACTIVE' as any,
        },
      });
    }

    // 1. Create Plan + DRAFT PlanVersion + children
    const plan = await prisma.plan.create({
      data: {
        code: testCode,
        name: 'Immutability Test Plan',
        description: 'Testing PostgreSQL trigger immutability',
        status: 'DRAFT' as any,
        visibility: 'PUBLIC' as any,
        displayOrder: 99,
      },
    });

    const draftVersion = await prisma.planVersion.create({
      data: {
        planId: plan.id,
        version: 1,
        status: 'DRAFT' as any,
      },
    });

    const pricing = await prisma.planPricing.create({
      data: {
        planVersionId: draftVersion.id,
        billingCycle: 'MONTHLY' as any,
        currency: 'INR',
        perSeatFee: 499,
        taxMode: 'EXCLUSIVE' as any,
        prorationPolicy: 'IMMEDIATE' as any,
      },
    });

    const limit = await prisma.planLimit.create({
      data: {
        planVersionId: draftVersion.id,
        limitCode: 'minimum_seats',
        valueType: 'INTEGER' as any,
        integerValue: 5,
        isUnlimited: false,
      },
    });

    const planModule = await prisma.planModule.create({
      data: {
        planVersionId: draftVersion.id,
        moduleId: coreModule.id,
      },
    });

    const commercialRule = await prisma.planCommercialRule.create({
      data: {
        planVersionId: draftVersion.id,
        schemaVersion: 1,
        rules: { trialEnabled: true, trialDurationDays: 14 },
      },
    });

    // 2. Publish PlanVersion (DRAFT -> PUBLISHED allowed transition)
    const publishedVersion = await prisma.planVersion.update({
      where: { id: draftVersion.id },
      data: {
        status: 'PUBLISHED' as any,
        publishedAt: new Date(),
      },
    });

    await prisma.plan.update({
      where: { id: plan.id },
      data: {
        status: 'ACTIVE' as any,
        currentPublishedVersionId: publishedVersion.id,
      },
    });

    // 3. PROVE DATABASE IMMUTABILITY: Every single mutation attempt on published version or child MUST fail!

    // A. Attempt to update published PlanVersion
    await expect(
      prisma.planVersion.update({
        where: { id: publishedVersion.id },
        data: { version: 2 },
      })
    ).rejects.toThrow();

    // B. Attempt to delete published PlanVersion
    await expect(
      prisma.planVersion.delete({
        where: { id: publishedVersion.id },
      })
    ).rejects.toThrow();

    // C. Attempt to update published PlanPricing
    await expect(
      prisma.planPricing.update({
        where: { id: pricing.id },
        data: { perSeatFee: 999 },
      })
    ).rejects.toThrow();

    // D. Attempt to delete published PlanPricing
    await expect(
      prisma.planPricing.delete({
        where: { id: pricing.id },
      })
    ).rejects.toThrow();

    // E. Attempt to create new PlanPricing under published version
    await expect(
      prisma.planPricing.create({
        data: {
          planVersionId: publishedVersion.id,
          billingCycle: 'ANNUAL' as any,
          currency: 'INR',
          perSeatFee: 399,
          taxMode: 'EXCLUSIVE' as any,
          prorationPolicy: 'IMMEDIATE' as any,
        },
      })
    ).rejects.toThrow();

    // F. Attempt to update published PlanLimit
    await expect(
      prisma.planLimit.update({
        where: { id: limit.id },
        data: { integerValue: 50 },
      })
    ).rejects.toThrow();

    // G. Attempt to delete published PlanLimit
    await expect(
      prisma.planLimit.delete({
        where: { id: limit.id },
      })
    ).rejects.toThrow();

    // H. Attempt to create new PlanLimit under published version
    await expect(
      prisma.planLimit.create({
        data: {
          planVersionId: publishedVersion.id,
          limitCode: 'storage_gb',
          valueType: 'DECIMAL' as any,
          decimalValue: 100,
          isUnlimited: false,
        },
      })
    ).rejects.toThrow();

    // I. Attempt to delete published PlanModule
    await expect(
      prisma.planModule.delete({
        where: { id: planModule.id },
      })
    ).rejects.toThrow();

    // J. Attempt to create new PlanModule under published version
    await expect(
      prisma.planModule.create({
        data: {
          planVersionId: publishedVersion.id,
          moduleId: coreModule.id,
        },
      })
    ).rejects.toThrow();

    // K. Attempt to update published PlanCommercialRule
    await expect(
      prisma.planCommercialRule.update({
        where: { id: commercialRule.id },
        data: { rules: { trialEnabled: false } },
      })
    ).rejects.toThrow();
  });
});
