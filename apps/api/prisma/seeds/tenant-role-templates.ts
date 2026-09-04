import { PrismaClient } from '@prisma/client';

export const DEFAULT_TENANT_ROLE_TEMPLATES = [
  {
    code: 'tenant_admin',
    name: 'Tenant Administrator',
    description: 'Tenant Owner / Administrator with full workspace administration control',
    isSystem: true,
  },
  {
    code: 'sales_manager',
    name: 'Sales Manager',
    description: 'Sales Manager with team oversight, lead assignment, and territory management',
    isSystem: true,
  },
  {
    code: 'team_leader',
    name: 'Team Leader',
    description: 'Team Leader overseeing direct executive field activities, attendance, and follow-ups',
    isSystem: true,
  },
  {
    code: 'field_executive',
    name: 'Field Executive',
    description: 'Field Executive executing ground visits, lead updates, demos, and order capture',
    isSystem: true,
  },
  {
    code: 'finance_ops',
    name: 'Finance Operations',
    description: 'Finance Operations managing collections, invoices, ledger, and payroll structures',
    isSystem: true,
  },
  {
    code: 'support',
    name: 'Tenant Support',
    description: 'Tenant Support Executive assisting users, handling customer queries, and audit review',
    isSystem: true,
  },
];

export async function seedTenantRoleTemplates(client: PrismaClient) {
  for (const templateDef of DEFAULT_TENANT_ROLE_TEMPLATES) {
    await client.tenantRoleTemplate.upsert({
      where: { code: templateDef.code },
      update: {
        name: templateDef.name,
        description: templateDef.description,
        isSystem: templateDef.isSystem,
        isActive: true,
      },
      create: {
        code: templateDef.code,
        name: templateDef.name,
        description: templateDef.description,
        isSystem: templateDef.isSystem,
        isActive: true,
      },
    });
  }
}
