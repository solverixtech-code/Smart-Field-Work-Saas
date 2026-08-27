import { PrismaClient, Role } from '@prisma/client';
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

  // Seed role 2FA settings — enable for SUPER_ADMIN & PLATFORM_SUPER_ADMIN only
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
