import { PrismaClient } from '@prisma/client';

export const DEFAULT_PLATFORM_ROLES = [
  {
    code: 'PLATFORM_SUPER_ADMIN',
    name: 'Platform Super Admin',
    description: 'Platform Super Admin with unconstrained platform console control',
    isSystem: true,
  },
  {
    code: 'PLATFORM_OPERATIONS_ADMIN',
    name: 'Platform Operations Admin',
    description: 'Platform Operations Admin managing tenant workspaces, plans, and capability catalog',
    isSystem: true,
  },
  {
    code: 'PLATFORM_ONBOARDING',
    name: 'Platform Onboarding Specialist',
    description: 'Platform Onboarding Specialist managing tenant creation, initial provisioning, and setup',
    isSystem: true,
  },
  {
    code: 'PLATFORM_SUPPORT',
    name: 'Platform Support Helpdesk',
    description: 'Platform Support Helpdesk with tenant support access and audit visibility',
    isSystem: true,
  },
  {
    code: 'PLATFORM_BILLING',
    name: 'Platform Billing Operations',
    description: 'Platform Billing & Finance Operations managing subscriptions, billing, and invoices',
    isSystem: true,
  },
  {
    code: 'PLATFORM_AUDITOR',
    name: 'Platform Compliance Auditor',
    description: 'Platform Compliance Auditor with read-only audit log and security visibility',
    isSystem: true,
  },
];

export async function seedPlatformRoles(client: PrismaClient) {
  for (const roleDef of DEFAULT_PLATFORM_ROLES) {
    await client.platformRole.upsert({
      where: { code: roleDef.code },
      update: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        isActive: true,
      },
      create: {
        code: roleDef.code,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        isActive: true,
      },
    });
  }
}
