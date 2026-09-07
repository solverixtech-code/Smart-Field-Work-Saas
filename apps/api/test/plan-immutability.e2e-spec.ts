import { PrismaClient } from '@prisma/client';

describe('Plan Commercial Engine — Database Immutability & Pointer Invariant E2E Test Suite', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    const testDbUrl = process.env.TEST_DATABASE_URL;
    if (!testDbUrl) {
      throw new Error('E2E Safety Guard: TEST_DATABASE_URL environment variable is mandatory.');
    }
    if (!testDbUrl.includes('visiblo_crm_test') && !testDbUrl.includes('_test')) {
      throw new Error(`E2E Safety Guard: TEST_DATABASE_URL '${testDbUrl}' does not contain explicit test database marker ('_test').`);
    }

    process.env.DATABASE_URL = testDbUrl;
    prisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. should enforce database-level immutability on published PlanVersion and child records', async () => {
    const testCode = `IMMUTABLE_TEST_${Date.now()}`;

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

    // Create Plan + DRAFT PlanVersion + children
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
        model: 'PER_USER' as any,
        billingCycle: 'MONTHLY' as any,
        currency: 'INR',
        perSeatFee: '499.00',
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

    // Publish PlanVersion (DRAFT -> PUBLISHED allowed transition)
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

    // PROVE DATABASE IMMUTABILITY: Every single mutation attempt on published version or child MUST fail!
    await expect(
      prisma.planVersion.update({
        where: { id: publishedVersion.id },
        data: { version: 2 },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planVersion.delete({
        where: { id: publishedVersion.id },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planPricing.update({
        where: { id: pricing.id },
        data: { perSeatFee: '999.00' },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planPricing.delete({
        where: { id: pricing.id },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planPricing.create({
        data: {
          planVersionId: publishedVersion.id,
          model: 'PER_USER' as any,
          billingCycle: 'ANNUAL' as any,
          currency: 'INR',
          perSeatFee: '399.00',
          taxMode: 'EXCLUSIVE' as any,
          prorationPolicy: 'IMMEDIATE' as any,
        },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planLimit.update({
        where: { id: limit.id },
        data: { integerValue: 50 },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planLimit.delete({
        where: { id: limit.id },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planLimit.create({
        data: {
          planVersionId: publishedVersion.id,
          limitCode: 'storage_gb',
          valueType: 'DECIMAL' as any,
          decimalValue: '100.00',
          isUnlimited: false,
        },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planModule.delete({
        where: { id: planModule.id },
      })
    ).rejects.toThrow();

    await expect(
      prisma.planCommercialRule.update({
        where: { id: commercialRule.id },
        data: { rules: { trialEnabled: false } },
      })
    ).rejects.toThrow();
  });

  it('2. should enforce v1 -> v2 versioning mechanics while keeping v1 completely immutable', async () => {
    const testCode = `V1_V2_TEST_${Date.now()}`;

    const plan = await prisma.plan.create({
      data: {
        code: testCode,
        name: 'V1 V2 Test Plan',
        description: 'Testing v1 -> v2 versioning',
        status: 'DRAFT' as any,
        visibility: 'PUBLIC' as any,
      },
    });

    // Create & publish v1
    const v1 = await prisma.planVersion.create({
      data: { planId: plan.id, version: 1, status: 'DRAFT' as any },
    });
    await prisma.planPricing.create({
      data: { planVersionId: v1.id, model: 'PER_USER' as any, billingCycle: 'MONTHLY' as any, currency: 'INR', perSeatFee: '499.00', taxMode: 'EXCLUSIVE' as any, prorationPolicy: 'NONE' as any },
    });
    await prisma.planVersion.update({ where: { id: v1.id }, data: { status: 'PUBLISHED' as any, publishedAt: new Date() } });
    await prisma.plan.update({ where: { id: plan.id }, data: { status: 'ACTIVE' as any, currentPublishedVersionId: v1.id } });

    // Create v2 draft
    const v2 = await prisma.planVersion.create({
      data: { planId: plan.id, version: 2, status: 'DRAFT' as any },
    });
    const v2Pricing = await prisma.planPricing.create({
      data: { planVersionId: v2.id, model: 'PER_USER' as any, billingCycle: 'MONTHLY' as any, currency: 'INR', perSeatFee: '699.00', taxMode: 'EXCLUSIVE' as any, prorationPolicy: 'NONE' as any },
    });

    // Mutating v2 draft succeeds
    const updatedV2Pricing = await prisma.planPricing.update({
      where: { id: v2Pricing.id },
      data: { perSeatFee: '799.00' },
    });
    expect(updatedV2Pricing.perSeatFee?.toNumber()).toBe(799);

    // Mutating v1 published version STILL fails
    await expect(
      prisma.planVersion.update({ where: { id: v1.id }, data: { version: 99 } })
    ).rejects.toThrow();
  });

  it('3. should enforce database trigger for currentPublishedVersionId pointer invariant', async () => {
    const plan1 = await prisma.plan.create({
      data: { code: `P1_${Date.now()}`, name: 'Plan 1', description: 'Plan 1', status: 'DRAFT' as any },
    });
    const plan2 = await prisma.plan.create({
      data: { code: `P2_${Date.now()}`, name: 'Plan 2', description: 'Plan 2', status: 'DRAFT' as any },
    });

    const v1Draft = await prisma.planVersion.create({
      data: { planId: plan1.id, version: 1, status: 'DRAFT' as any },
    });

    const v2Plan2Pub = await prisma.planVersion.create({
      data: { planId: plan2.id, version: 1, status: 'DRAFT' as any },
    });
    await prisma.planVersion.update({ where: { id: v2Plan2Pub.id }, data: { status: 'PUBLISHED' as any, publishedAt: new Date() } });

    // A. Pointing currentPublishedVersionId to a DRAFT version MUST fail at database trigger level
    await expect(
      prisma.plan.update({
        where: { id: plan1.id },
        data: { currentPublishedVersionId: v1Draft.id },
      })
    ).rejects.toThrow();

    // B. Pointing currentPublishedVersionId to a PUBLISHED version of a DIFFERENT plan MUST fail
    await expect(
      prisma.plan.update({
        where: { id: plan1.id },
        data: { currentPublishedVersionId: v2Plan2Pub.id },
      })
    ).rejects.toThrow();
  });

  it('4. DRAFT PlanVersion delete succeeds (M5.2 trigger fix validation)', async () => {
    const plan = await prisma.plan.create({
      data: {
        code: `DRAFT_DEL_${Date.now()}`,
        name: 'Draft Delete Test Plan',
        description: 'Testing draft deletion trigger behavior',
        status: 'DRAFT' as any,
      },
    });

    const draftVersion = await prisma.planVersion.create({
      data: { planId: plan.id, version: 1, status: 'DRAFT' as any },
    });

    // Delete DRAFT version -> MUST succeed cleanly (trigger returns OLD)
    const deleted = await prisma.planVersion.delete({
      where: { id: draftVersion.id },
    });

    expect(deleted.id).toBe(draftVersion.id);

    const check = await prisma.planVersion.findUnique({
      where: { id: draftVersion.id },
    });
    expect(check).toBeNull();
  });

  it('5. Single SQL UPDATE attempting DRAFT -> PUBLISHED while changing version or planId must fail (M5.2 identity lock validation)', async () => {
    const plan1 = await prisma.plan.create({
      data: { code: `ID_LOCK_P1_${Date.now()}`, name: 'ID Lock Plan 1', description: 'Test', status: 'DRAFT' as any },
    });
    const plan2 = await prisma.plan.create({
      data: { code: `ID_LOCK_P2_${Date.now()}`, name: 'ID Lock Plan 2', description: 'Test', status: 'DRAFT' as any },
    });

    const draftVersion = await prisma.planVersion.create({
      data: { planId: plan1.id, version: 1, status: 'DRAFT' as any },
    });

    // Attempt DRAFT -> PUBLISHED while changing version (1 -> 99) -> MUST fail at DB trigger level!
    await expect(
      prisma.$executeRawUnsafe(
        `UPDATE "PlanVersion" SET status = 'PUBLISHED', version = 99, "publishedAt" = NOW() WHERE id = '${draftVersion.id}'`
      )
    ).rejects.toThrow();

    // Attempt DRAFT -> PUBLISHED while changing planId -> MUST fail at DB trigger level!
    await expect(
      prisma.$executeRawUnsafe(
        `UPDATE "PlanVersion" SET status = 'PUBLISHED', "planId" = '${plan2.id}', "publishedAt" = NOW() WHERE id = '${draftVersion.id}'`
      )
    ).rejects.toThrow();
  });
});
