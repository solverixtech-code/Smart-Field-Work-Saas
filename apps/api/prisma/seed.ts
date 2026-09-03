import { PrismaClient, Role, PlatformModuleCategory, PlatformModuleStatus, ModuleFeatureStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
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
        passwordHash: defaultPassword,
        fullName: u.fullName,
        role: u.role,
        status: 'ACTIVE',
      },
      create: {
        employeeCode: u.employeeCode,
        fullName: u.fullName,
        email: u.email,
        passwordHash: defaultPassword,
        role: u.role,
        mobile: u.mobile,
        status: 'ACTIVE',
      },
    });
  }

  // Seed team
  await prisma.team.upsert({
    where: { code: 'MUMBAI-WEST' },
    update: {},
    create: {
      name: 'Mumbai West',
      code: 'MUMBAI-WEST',
      description: 'Field sales team covering western Mumbai',
    },
  });

  // Seed role 2FA settings
  const twoFactorRoles = [
    { role: Role.SUPER_ADMIN, enabled: true },
    { role: Role.ADMIN, enabled: false },
    { role: Role.SALES_MANAGER, enabled: false },
    { role: Role.TEAM_LEADER, enabled: false },
    { role: Role.FINANCE_OPS, enabled: false },
    { role: Role.SUPPORT, enabled: false },
    { role: Role.PLATFORM_SUPER_ADMIN, enabled: true },
    { role: Role.PLATFORM_OPERATIONS_ADMIN, enabled: false },
    { role: Role.PLATFORM_ONBOARDING, enabled: false },
    { role: Role.PLATFORM_SUPPORT, enabled: false },
    { role: Role.PLATFORM_BILLING, enabled: false },
    { role: Role.PLATFORM_AUDITOR, enabled: false },
  ];

  for (const setting of twoFactorRoles) {
    await prisma.roleTwoFactorSetting.upsert({
      where: { role: setting.role },
      update: { enabled: setting.enabled },
      create: { role: setting.role, enabled: setting.enabled },
    });
  }

  // ─── Seed Platform Module Permissions ─────────────────────────────────────
  const moduleActions = ['view', 'create', 'update', 'archive'];
  const moduleKey = 'platform.modules';

  for (const action of moduleActions) {
    const perm = await prisma.permission.upsert({
      where: {
        moduleKey_action: { moduleKey, action },
      },
      update: { description: `Permission to ${action} platform modules` },
      create: {
        moduleKey,
        action,
        description: `Permission to ${action} platform modules`,
      },
    });

    const allowedRoles: Role[] =
      action === 'view'
        ? [
            Role.PLATFORM_SUPER_ADMIN,
            Role.PLATFORM_OPERATIONS_ADMIN,
            Role.PLATFORM_SUPPORT,
            Role.PLATFORM_AUDITOR,
          ]
        : [Role.PLATFORM_SUPER_ADMIN, Role.PLATFORM_OPERATIONS_ADMIN];

    for (const r of allowedRoles) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: { role: r, permissionId: perm.id },
        },
        update: {},
        create: {
          role: r,
          permissionId: perm.id,
        },
      });
    }
  }

  // ─── Seed Canonical Platform Modules & Features ───────────────────────────
  const canonicalModules = [
    {
      code: 'core_crm',
      name: 'Core CRM & Lead Management',
      description: 'Lead capture, pipeline stages, lead assignment & auto-routing',
      category: PlatformModuleCategory.CORE,
      status: PlatformModuleStatus.ACTIVE,
      isAddon: false,
      monthlyPrice: 0,
      requiredBySystem: true,
      displayOrder: 1,
      features: [
        { code: 'lead_pipeline', name: 'Lead Pipeline Stages', description: 'Customizable lead status workflow & deal stages', status: ModuleFeatureStatus.ACTIVE, displayOrder: 1 },
        { code: 'auto_routing', name: 'Auto-Routing & Territory Lead Assignment', description: 'Rule-based lead assignment to field reps', status: ModuleFeatureStatus.ACTIVE, displayOrder: 2 },
        { code: 'contact_manager', name: 'Account & Contact Management', description: 'Unified customer account profiles & contacts', status: ModuleFeatureStatus.ACTIVE, displayOrder: 3 },
        { code: 'activity_timeline', name: 'Activity Log & Notes', description: 'Chronological timeline of calls, emails & field meetings', status: ModuleFeatureStatus.ACTIVE, displayOrder: 4 },
      ],
    },
    {
      code: 'field_visits',
      name: 'GPS Field Visit Tracking',
      description: 'Geofenced check-ins, route map playback, visit proof attachments',
      category: PlatformModuleCategory.FIELD_OPS,
      status: PlatformModuleStatus.ACTIVE,
      isAddon: false,
      monthlyPrice: 0,
      requiredBySystem: false,
      displayOrder: 2,
      features: [
        { code: 'geofence_checkin', name: 'Geofenced Check-In & Check-Out', description: 'Location-verified GPS check-ins at client site', status: ModuleFeatureStatus.ACTIVE, displayOrder: 1 },
        { code: 'route_playback', name: 'GPS Route Map Playback', description: 'Real-time breadcrumb route tracking & distance log', status: ModuleFeatureStatus.ACTIVE, displayOrder: 2 },
        { code: 'visit_proof', name: 'Photo & Document Proof', description: 'Mandatory photo capture & client signature attachment', status: ModuleFeatureStatus.ACTIVE, displayOrder: 3 },
        { code: 'beat_planner', name: 'Beat & PJP Route Planner', description: 'Permanent Journey Plan (PJP) & daily beat schedule', status: ModuleFeatureStatus.ACTIVE, displayOrder: 4 },
        { code: 'site_surveys', name: 'Custom Field Forms & Audits', description: 'Dynamic audit checklists, site survey & store audit forms', status: ModuleFeatureStatus.ACTIVE, displayOrder: 5 },
      ],
    },
    {
      code: 'demo_scheduler',
      name: 'Demo & Presentation Suite',
      description: 'Product demo scheduling, collateral playback, client sign-off',
      category: PlatformModuleCategory.SALES,
      status: PlatformModuleStatus.ACTIVE,
      isAddon: true,
      monthlyPrice: 499,
      requiredBySystem: false,
      displayOrder: 3,
      features: [
        { code: 'demo_calendar', name: 'Demo Appointment Calendar', description: 'Interactive demo booking & automated client SMS reminders', status: ModuleFeatureStatus.ACTIVE, displayOrder: 1 },
        { code: 'collateral_vault', name: 'Product Presentation Vault', description: 'Offline-capable brochure, video & PDF collateral viewer', status: ModuleFeatureStatus.ACTIVE, displayOrder: 2 },
        { code: 'client_signoff', name: 'Digital Client Sign-off', description: 'On-screen client rating & digital agreement signature', status: ModuleFeatureStatus.ACTIVE, displayOrder: 3 },
      ],
    },
    {
      code: 'order_management',
      name: 'Field Order Booking & Invoicing',
      description: 'Product catalog, primary/secondary order booking, tax invoice PDF',
      category: PlatformModuleCategory.SALES,
      status: PlatformModuleStatus.ACTIVE,
      isAddon: true,
      monthlyPrice: 799,
      requiredBySystem: false,
      displayOrder: 4,
      dependsOnCodes: ['core_crm'],
      features: [
        { code: 'primary_secondary_booking', name: 'Primary & Secondary Order Booking', description: 'Distributor & retailer purchase order creation', status: ModuleFeatureStatus.ACTIVE, displayOrder: 1 },
        { code: 'product_catalog', name: 'SKU Price Books & Discounts', description: 'Tiered price lists, schemes & promotional discounts', status: ModuleFeatureStatus.ACTIVE, displayOrder: 2 },
        { code: 'tax_invoice', name: 'GST Tax Invoice PDF', description: 'Instant PDF invoice generation & WhatsApp sharing', status: ModuleFeatureStatus.ACTIVE, displayOrder: 3 },
        { code: 'dealer_ledger', name: 'Dealer Credit & Payment Collection', description: 'Outstanding ledger balances & payment receipt entry', status: ModuleFeatureStatus.ACTIVE, displayOrder: 4 },
      ],
    },
    {
      code: 'attendance_plus',
      name: 'Face AI & Geofence Attendance',
      description: 'Selfie biometric check-in, late arrival penalty rules, muster roll',
      category: PlatformModuleCategory.FIELD_OPS,
      status: PlatformModuleStatus.ACTIVE,
      isAddon: true,
      monthlyPrice: 399,
      requiredBySystem: false,
      displayOrder: 5,
      features: [
        { code: 'face_biometric', name: 'AI Selfie & Face Verification', description: 'Liveness detection selfie clock-in to eliminate buddy punching', status: ModuleFeatureStatus.ACTIVE, displayOrder: 1 },
        { code: 'shift_rules', name: 'Shift & Grace Period Rules', description: 'Configurable shift timings, half-day thresholds & late penalties', status: ModuleFeatureStatus.ACTIVE, displayOrder: 2 },
        { code: 'muster_roll', name: 'Automated Muster Roll Reports', description: 'Monthly attendance summary exportable for HR processing', status: ModuleFeatureStatus.ACTIVE, displayOrder: 3 },
      ],
    },
    {
      code: 'payroll_engine',
      name: 'Field Executive Payroll & Payslips',
      description: 'Salary calculations, TA/DA allowances, incentive payouts, PDF payslip',
      category: PlatformModuleCategory.ENTERPRISE,
      status: PlatformModuleStatus.ACTIVE,
      isAddon: true,
      monthlyPrice: 999,
      requiredBySystem: false,
      displayOrder: 6,
      features: [
        { code: 'allowance_tada', name: 'TA/DA Travel Allowance Engine', description: 'Per-km travel reimbursement & daily food allowance calculation', status: ModuleFeatureStatus.ACTIVE, displayOrder: 1 },
        { code: 'incentive_slabs', name: 'Sales Target & Incentive Slabs', description: 'Automated commission & target achievement bonus calculations', status: ModuleFeatureStatus.ACTIVE, displayOrder: 2 },
        { code: 'payslip_generator', name: 'PDF Payslip Generator', description: 'One-click salary processing & employee portal PDF distribution', status: ModuleFeatureStatus.ACTIVE, displayOrder: 3 },
      ],
    },
    {
      code: 'whatsapp_automation',
      name: 'WhatsApp & Meta Lead Sync',
      description: 'Official WhatsApp Business API integration, auto-reply bots',
      category: PlatformModuleCategory.AUTOMATION,
      status: PlatformModuleStatus.ACTIVE,
      isAddon: true,
      monthlyPrice: 1299,
      requiredBySystem: false,
      displayOrder: 7,
      features: [
        { code: 'meta_lead_sync', name: 'Facebook & Instagram Lead Sync', description: 'Instant auto-import of leads from Meta Lead Gen Ads', status: ModuleFeatureStatus.ACTIVE, displayOrder: 1 },
        { code: 'whatsapp_bot', name: 'WhatsApp Cloud API Auto-Responder', description: 'Official WhatsApp Business API interactive chatbot', status: ModuleFeatureStatus.ACTIVE, displayOrder: 2 },
        { code: 'template_broadcast', name: 'Approved Template Broadcasts', description: 'Bulk marketing campaigns & template message tracking', status: ModuleFeatureStatus.ACTIVE, displayOrder: 3 },
      ],
    },
    {
      code: 'ai_copilot',
      name: 'AI Sales Copilot & Target Coach',
      description: 'AI recommended next best action, churn prediction, automated summary',
      category: PlatformModuleCategory.AUTOMATION,
      status: PlatformModuleStatus.BETA,
      isAddon: true,
      monthlyPrice: 1499,
      requiredBySystem: false,
      displayOrder: 8,
      features: [
        { code: 'next_best_action', name: 'AI Recommended Next Best Action', description: 'Intelligent daily visit prioritization for maximum conversion', status: ModuleFeatureStatus.BETA, displayOrder: 1 },
        { code: 'visit_summary_ai', name: 'Voice & Call Notes Summarizer', description: 'AI transcription & automated key takeaway extraction', status: ModuleFeatureStatus.BETA, displayOrder: 2 },
        { code: 'target_coaching', name: 'Sales Target & Churn Predictor', description: 'Predictive analytics on deal closure probability & churn risk', status: ModuleFeatureStatus.BETA, displayOrder: 3 },
      ],
    },
  ];

  const codeToIdMap = new Map<string, string>();

  // Upsert modules and child features
  for (const mData of canonicalModules) {
    const { features, dependsOnCodes, ...mFields } = mData;

    const mod = await prisma.platformModule.upsert({
      where: { code: mFields.code },
      update: {
        name: mFields.name,
        description: mFields.description,
        category: mFields.category,
        status: mFields.status,
        isAddon: mFields.isAddon,
        monthlyPrice: mFields.monthlyPrice,
        requiredBySystem: mFields.requiredBySystem,
        displayOrder: mFields.displayOrder,
      },
      create: mFields,
    });

    codeToIdMap.set(mod.code, mod.id);

    if (features) {
      for (const feat of features) {
        await prisma.moduleFeature.upsert({
          where: {
            moduleId_code: { moduleId: mod.id, code: feat.code },
          },
          update: {
            name: feat.name,
            description: feat.description,
            status: feat.status,
            displayOrder: feat.displayOrder,
          },
          create: {
            moduleId: mod.id,
            code: feat.code,
            name: feat.name,
            description: feat.description,
            status: feat.status,
            displayOrder: feat.displayOrder,
          },
        });
      }
    }
  }

  // Seed dependencies (e.g. order_management depends on core_crm)
  for (const mData of canonicalModules) {
    if (mData.dependsOnCodes) {
      const childId = codeToIdMap.get(mData.code);
      if (childId) {
        for (const depCode of mData.dependsOnCodes) {
          const parentId = codeToIdMap.get(depCode);
          if (parentId) {
            await prisma.moduleDependency.upsert({
              where: {
                moduleId_dependsOnModuleId: {
                  moduleId: childId,
                  dependsOnModuleId: parentId,
                },
              },
              update: {},
              create: {
                moduleId: childId,
                dependsOnModuleId: parentId,
              },
            });
          }
        }
      }
    }
  }

  console.log('Seed completed. Default password: Visiblo@2025');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
