import { PlanPublicationPolicyService } from './plan-publication-policy.service';
import { PlatformModuleStatus } from '@prisma/client';

describe('PlanPublicationPolicyService', () => {
  let policyService: PlanPublicationPolicyService;
  let mockPrisma: any;
  let mockModulesService: any;

  beforeEach(() => {
    mockPrisma = {};
    mockModulesService = {
      getCanonicalCatalog: jest.fn().mockResolvedValue([
        {
          code: 'core_crm',
          name: 'Core CRM',
          requiredBySystem: true,
          status: PlatformModuleStatus.ACTIVE,
          dependencies: [],
        },
        {
          code: 'field_visits',
          name: 'Field Visits',
          requiredBySystem: false,
          status: PlatformModuleStatus.ACTIVE,
          dependencies: [{ dependsOnModuleCode: 'core_crm' }],
        },
        {
          code: 'attendance',
          name: 'Attendance & Leave',
          requiredBySystem: false,
          status: PlatformModuleStatus.ACTIVE,
          dependencies: [],
        },
        {
          code: 'payroll',
          name: 'Payroll Engine',
          requiredBySystem: false,
          status: PlatformModuleStatus.ACTIVE,
          dependencies: [{ dependsOnModuleCode: 'attendance' }],
        },
        {
          code: 'ai_copilot',
          name: 'AI Copilot',
          requiredBySystem: false,
          status: PlatformModuleStatus.BETA,
          dependencies: [{ dependsOnModuleCode: 'core_crm' }],
        },
      ]),
    };

    policyService = new PlanPublicationPolicyService(mockPrisma as any, mockModulesService as any);
  });

  it('should pass validation for a valid plan version payload', async () => {
    const pricing: any = [
      {
        model: 'PER_USER',
        billingCycle: 'MONTHLY',
        currency: 'INR',
        perSeatFee: 899,
        taxMode: 'EXCLUSIVE',
        prorationPolicy: 'IMMEDIATE',
      },
    ];

    const limits: any = [
      { limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 3, isUnlimited: false },
      { limitCode: 'default_seat_limit', valueType: 'INTEGER', integerValue: 25, isUnlimited: false },
      { limitCode: 'maximum_seats', valueType: 'INTEGER', integerValue: 100, isUnlimited: false },
      { limitCode: 'storage_gb', valueType: 'DECIMAL', decimalValue: 50, isUnlimited: false },
    ];

    const includedModules = ['core_crm', 'field_visits', 'attendance'];
    const commercialRules: any = {
      trialEnabled: true,
      trialDurationDays: 14,
      gracePeriodDays: 7,
    };

    const result = await policyService.validateForPublication(
      pricing,
      limits,
      includedModules,
      commercialRules,
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail if system-required module core_crm is missing', async () => {
    const pricing: any = [{ model: 'FLAT', billingCycle: 'MONTHLY', currency: 'INR', flatFee: 5000, taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }];
    const limits: any = [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1, isUnlimited: false }];
    const includedModules = ['attendance']; // Missing core_crm!
    const commercialRules: any = { trialEnabled: false, gracePeriodDays: 7 };

    const result = await policyService.validateForPublication(
      pricing,
      limits,
      includedModules,
      commercialRules,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PLAN_REQUIRED_MODULE_MISSING')).toBe(true);
  });

  it('should fail if a module dependency is missing (field_visits requires core_crm)', async () => {
    // Make core_crm not system required for this test scenario
    mockModulesService.getCanonicalCatalog.mockResolvedValue([
      { code: 'core_crm', name: 'Core CRM', requiredBySystem: false, status: PlatformModuleStatus.ACTIVE, dependencies: [] },
      { code: 'field_visits', name: 'Field Visits', requiredBySystem: false, status: PlatformModuleStatus.ACTIVE, dependencies: [{ dependsOnModuleCode: 'core_crm' }] },
    ]);

    const pricing: any = [{ model: 'FLAT', billingCycle: 'MONTHLY', currency: 'INR', flatFee: 5000, taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }];
    const limits: any = [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1, isUnlimited: false }];
    const includedModules = ['field_visits']; // Missing dependency core_crm!
    const commercialRules: any = { trialEnabled: false, gracePeriodDays: 7 };

    const result = await policyService.validateForPublication(
      pricing,
      limits,
      includedModules,
      commercialRules,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PLAN_MODULE_DEPENDENCY_MISSING')).toBe(true);
  });

  it('should fail if seat limit rules are violated (default < min or max < default)', async () => {
    const pricing: any = [{ model: 'FLAT', billingCycle: 'MONTHLY', currency: 'INR', flatFee: 5000, taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }];
    const limits: any = [
      { limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 10, isUnlimited: false },
      { limitCode: 'default_seat_limit', valueType: 'INTEGER', integerValue: 5, isUnlimited: false }, // Violates default >= min
    ];
    const includedModules = ['core_crm'];
    const commercialRules: any = { trialEnabled: false, gracePeriodDays: 7 };

    const result = await policyService.validateForPublication(
      pricing,
      limits,
      includedModules,
      commercialRules,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PLAN_LIMIT_INVALID')).toBe(true);
  });

  it('should fail if obsolete module alias is provided', async () => {
    const pricing: any = [{ model: 'FLAT', billingCycle: 'MONTHLY', currency: 'INR', flatFee: 5000, taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }];
    const limits: any = [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1, isUnlimited: false }];
    const includedModules = ['core_crm', 'attendance_plus']; // Obsolete alias!
    const commercialRules: any = { trialEnabled: false, gracePeriodDays: 7 };

    const result = await policyService.validateForPublication(
      pricing,
      limits,
      includedModules,
      commercialRules,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PLAN_MODULE_ALIAS_PROHIBITED')).toBe(true);
  });
});
