import { PrismaClient, PlatformModuleStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  console.log('Seeding candidate commercial plans...');

  const plansData = [
    {
      code: 'STARTER',
      name: 'Starter Sales Suite',
      description: 'Essential lead tracking, attendance, and basic field activity management for small sales teams.',
      internalDescription: 'Entry tier for single-location or small field operations.',
      visibility: 'PUBLIC' as const,
      tier: 'Standard',
      badge: 'Popular for Small Teams',
      recommendedFor: '1-5 Field Executives',
      displayOrder: 1,
      color: '#3B82F6',
      pricing: [
        {
          model: 'PER_USER' as const,
          billingCycle: 'MONTHLY' as const,
          currency: 'INR',
          perSeatFee: 499,
          discountPercent: undefined as number | undefined,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
        {
          model: 'PER_USER' as const,
          billingCycle: 'ANNUAL' as const,
          currency: 'INR',
          perSeatFee: 399,
          discountPercent: 20.04,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
      ],
      limits: [
        { limitCode: 'minimum_seats', valueType: 'INTEGER' as const, integerValue: 5, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'default_seat_limit', valueType: 'INTEGER' as const, integerValue: 15, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'maximum_seats', valueType: 'INTEGER' as const, integerValue: 20, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'seat_increment', valueType: 'INTEGER' as const, integerValue: 1, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'storage_gb', valueType: 'DECIMAL' as const, integerValue: undefined as number | undefined, decimalValue: 10, isUnlimited: false, unit: 'GB' },
        { limitCode: 'data_retention_days', valueType: 'INTEGER' as const, integerValue: 90, decimalValue: undefined as number | undefined, isUnlimited: false, unit: 'days' },
      ],
      moduleCodes: ['core_crm', 'field_visits'],
      commercialRules: {
        trialEnabled: true,
        trialDurationDays: 14,
        trialSeatLimit: 5,
        trialModulePolicy: 'USE_PLAN_MODULES',
        autoConvertAfterTrial: false,
        autoRenew: true,
        allowUpgrade: true,
        allowDowngrade: true,
        changeEffectiveTiming: 'IMMEDIATE',
        minimumCommitmentMonths: '1',
        availableForNewTenants: true,
        availableForExistingTenants: true,
        cancellationAllowed: true,
        gracePeriodDays: 7,
        accessAfterExpiry: 'READ_ONLY',
      },
    },
    {
      code: 'GROWTH',
      name: 'Growth Field Suite',
      description: 'Advanced GPS visit tracking, beat planning, team management, and leave approval workflows.',
      internalDescription: 'Mid-market tier with live map location tracking and route playback.',
      visibility: 'PUBLIC' as const,
      tier: 'Professional',
      badge: 'Best Value',
      recommendedFor: '5-25 Field Executives',
      displayOrder: 2,
      color: '#10B981',
      pricing: [
        {
          model: 'PER_USER' as const,
          billingCycle: 'MONTHLY' as const,
          currency: 'INR',
          perSeatFee: 899,
          discountPercent: undefined as number | undefined,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
        {
          model: 'PER_USER' as const,
          billingCycle: 'ANNUAL' as const,
          currency: 'INR',
          perSeatFee: 749,
          discountPercent: 16.68,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
      ],
      limits: [
        { limitCode: 'minimum_seats', valueType: 'INTEGER' as const, integerValue: 3, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'default_seat_limit', valueType: 'INTEGER' as const, integerValue: 25, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'maximum_seats', valueType: 'INTEGER' as const, integerValue: 100, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'seat_increment', valueType: 'INTEGER' as const, integerValue: 5, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'storage_gb', valueType: 'DECIMAL' as const, integerValue: undefined as number | undefined, decimalValue: 50, isUnlimited: false, unit: 'GB' },
        { limitCode: 'data_retention_days', valueType: 'INTEGER' as const, integerValue: 180, decimalValue: undefined as number | undefined, isUnlimited: false, unit: 'days' },
      ],
      moduleCodes: ['core_crm', 'field_visits', 'attendance'],
      commercialRules: {
        trialEnabled: true,
        trialDurationDays: 14,
        trialSeatLimit: 10,
        trialModulePolicy: 'USE_PLAN_MODULES',
        autoConvertAfterTrial: false,
        autoRenew: true,
        allowUpgrade: true,
        allowDowngrade: true,
        changeEffectiveTiming: 'IMMEDIATE',
        minimumCommitmentMonths: '1',
        availableForNewTenants: true,
        availableForExistingTenants: true,
        cancellationAllowed: true,
        gracePeriodDays: 7,
        accessAfterExpiry: 'READ_ONLY',
      },
    },
    {
      code: 'PROFESSIONAL',
      name: 'Professional Field Suite',
      description: 'Complete field sales automation including demos, order booking, attendance & multi-currency sales management.',
      internalDescription: 'Full operations suite for multi-region sales & distribution teams.',
      visibility: 'PUBLIC' as const,
      tier: 'Enterprise',
      badge: 'Recommended for Growing Enterprises',
      recommendedFor: '25-100 Field Executives',
      displayOrder: 3,
      color: '#6366F1',
      pricing: [
        {
          model: 'PER_USER' as const,
          billingCycle: 'MONTHLY' as const,
          currency: 'INR',
          perSeatFee: 1199,
          discountPercent: undefined as number | undefined,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
        {
          model: 'PER_USER' as const,
          billingCycle: 'ANNUAL' as const,
          currency: 'INR',
          perSeatFee: 999,
          discountPercent: 16.68,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
      ],
      limits: [
        { limitCode: 'minimum_seats', valueType: 'INTEGER' as const, integerValue: 5, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'default_seat_limit', valueType: 'INTEGER' as const, integerValue: 50, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'maximum_seats', valueType: 'INTEGER' as const, integerValue: 250, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'seat_increment', valueType: 'INTEGER' as const, integerValue: 5, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'storage_gb', valueType: 'DECIMAL' as const, integerValue: undefined as number | undefined, decimalValue: 100, isUnlimited: false, unit: 'GB' },
        { limitCode: 'data_retention_days', valueType: 'INTEGER' as const, integerValue: 365, decimalValue: undefined as number | undefined, isUnlimited: false, unit: 'days' },
      ],
      moduleCodes: ['core_crm', 'field_visits', 'demo_scheduler', 'order_management', 'attendance'],
      commercialRules: {
        trialEnabled: true,
        trialDurationDays: 14,
        trialSeatLimit: 15,
        trialModulePolicy: 'USE_PLAN_MODULES',
        autoConvertAfterTrial: false,
        autoRenew: true,
        allowUpgrade: true,
        allowDowngrade: false,
        changeEffectiveTiming: 'IMMEDIATE',
        minimumCommitmentMonths: '1',
        availableForNewTenants: true,
        availableForExistingTenants: true,
        cancellationAllowed: true,
        gracePeriodDays: 7,
        accessAfterExpiry: 'READ_ONLY',
      },
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Custom Suite',
      description: 'Unlimited capacity, custom integrations, automated payroll, WhatsApp automation, and dedicated AI copilot.',
      internalDescription: 'Custom contract tier for large corporate clients with custom SLAs.',
      visibility: 'PUBLIC' as const,
      tier: 'Custom',
      badge: 'Custom Contract',
      recommendedFor: '100+ Field Executives',
      displayOrder: 4,
      color: '#0D1F3D',
      pricing: [
        {
          model: 'CUSTOM_CONTRACT' as const,
          billingCycle: 'MONTHLY' as const,
          currency: 'INR',
          perSeatFee: undefined as number | undefined,
          discountPercent: undefined as number | undefined,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
        {
          model: 'CUSTOM_CONTRACT' as const,
          billingCycle: 'ANNUAL' as const,
          currency: 'INR',
          perSeatFee: undefined as number | undefined,
          discountPercent: undefined as number | undefined,
          taxMode: 'EXCLUSIVE' as const,
          prorationPolicy: 'IMMEDIATE' as const,
        },
      ],
      limits: [
        { limitCode: 'minimum_seats', valueType: 'INTEGER' as const, integerValue: 10, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'default_seat_limit', valueType: 'INTEGER' as const, integerValue: 100, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'maximum_seats', valueType: 'INTEGER' as const, integerValue: undefined as number | undefined, decimalValue: undefined as number | undefined, isUnlimited: true, unit: undefined as string | undefined },
        { limitCode: 'seat_increment', valueType: 'INTEGER' as const, integerValue: 10, decimalValue: undefined as number | undefined, isUnlimited: false, unit: undefined as string | undefined },
        { limitCode: 'storage_gb', valueType: 'DECIMAL' as const, integerValue: undefined as number | undefined, decimalValue: 500, isUnlimited: false, unit: 'GB' },
        { limitCode: 'data_retention_days', valueType: 'INTEGER' as const, integerValue: 730, decimalValue: undefined as number | undefined, isUnlimited: false, unit: 'days' },
      ],
      moduleCodes: ['core_crm', 'field_visits', 'attendance', 'payroll', 'demo_scheduler', 'order_management', 'whatsapp_automation', 'ai_copilot'],
      commercialRules: {
        trialEnabled: true,
        trialDurationDays: 30,
        trialSeatLimit: 25,
        trialModulePolicy: 'USE_PLAN_MODULES',
        autoConvertAfterTrial: false,
        autoRenew: true,
        allowUpgrade: true,
        allowDowngrade: false,
        changeEffectiveTiming: 'IMMEDIATE',
        minimumCommitmentMonths: '12',
        availableForNewTenants: true,
        availableForExistingTenants: true,
        cancellationAllowed: true,
        gracePeriodDays: 14,
        accessAfterExpiry: 'READ_ONLY',
      },
    },
  ];

  const publishApproved = process.env.PUBLISH_SEED_PLANS === 'true';

  for (const planData of plansData) {
    const existing = await prisma.plan.findUnique({ where: { code: planData.code } });
    if (existing) {
      console.log(`Plan '${planData.code}' already exists. Skipping seed.`);
      continue;
    }

    // Verify EVERY requested module code exists in canonical catalog before seeding
    const modules = await prisma.platformModule.findMany({
      where: { code: { in: planData.moduleCodes } },
    });

    if (modules.length !== planData.moduleCodes.length) {
      const foundCodes = modules.map((m) => m.code);
      const missing = planData.moduleCodes.filter((c) => !foundCodes.includes(c));
      throw new Error(`Seed failed: Module codes missing from database catalog: ${missing.join(', ')}`);
    }

    const now = new Date();

    const plan = await prisma.$transaction(async (tx) => {
      const createdPlan = await tx.plan.create({
        data: {
          code: planData.code,
          name: planData.name,
          description: planData.description,
          internalDescription: planData.internalDescription,
          visibility: planData.visibility,
          tier: planData.tier,
          badge: planData.badge,
          recommendedFor: planData.recommendedFor,
          displayOrder: planData.displayOrder,
          color: planData.color,
          status: publishApproved ? 'ACTIVE' : 'DRAFT',
        },
      });

      // 1. Create version (DRAFT)
      const version = await tx.planVersion.create({
        data: {
          planId: createdPlan.id,
          version: 1,
          status: 'DRAFT',
        },
      });

      // 2. Insert child records (pricing, limits, modules, commercialRule)
      for (const p of planData.pricing) {
        await tx.planPricing.create({
          data: {
            planVersionId: version.id,
            model: p.model,
            billingCycle: p.billingCycle,
            currency: p.currency,
            perSeatFee: p.perSeatFee ?? null,
            discountPercent: p.discountPercent ?? null,
            taxMode: p.taxMode,
            prorationPolicy: p.prorationPolicy,
          },
        });
      }

      for (const l of planData.limits) {
        await tx.planLimit.create({
          data: {
            planVersionId: version.id,
            limitCode: l.limitCode,
            valueType: l.valueType,
            integerValue: l.integerValue ?? null,
            decimalValue: l.decimalValue ?? null,
            isUnlimited: l.isUnlimited,
            unit: l.unit ?? null,
          },
        });
      }

      for (const mod of modules) {
        await tx.planModule.create({
          data: {
            planVersionId: version.id,
            moduleId: mod.id,
          },
        });
      }

      await tx.planCommercialRule.create({
        data: {
          planVersionId: version.id,
          schemaVersion: 1,
          rules: planData.commercialRules,
        },
      });

      // 3. Optional publication only if explicit approval env var set
      if (publishApproved) {
        await tx.planVersion.update({
          where: { id: version.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
          },
        });

        await tx.plan.update({
          where: { id: createdPlan.id },
          data: { currentPublishedVersionId: version.id },
        });
      }

      return createdPlan;
    });

    console.log(`✅ Seeded Plan '${plan.code}' (Version 1, status: ${publishApproved ? 'PUBLISHED' : 'DRAFT'})`);
  }
}

seedPlans()
  .catch((err) => {
    console.error('❌ Failed to seed plans:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
