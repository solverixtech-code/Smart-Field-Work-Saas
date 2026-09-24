import { PrismaClient } from '@prisma/client';
import { DEFAULT_TENANT_ROLE_GRANTS, PERMISSION_REGISTRY, PERMISSION_REGISTRY_VERSION } from '../src/common/security/permission-registry';

const permissionCodes = ['crm.targets.manage', 'crm.incentives.manage', 'crm.incentives.approve', 'crm.incentives.payout'];

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(async (tx) => {
      for (const permissionCode of permissionCodes) {
        const definition = PERMISSION_REGISTRY.find((entry) => entry.code === permissionCode);
        if (!definition) throw new Error(`${permissionCode} is missing from the registry.`);
        const existing = await tx.permission.findFirst({ where: { OR: [{ code: permissionCode }, { moduleKey: definition.moduleKey, action: definition.action }] }, select: { id: true } });
        const permission = existing
          ? await tx.permission.update({ where: { id: existing.id }, data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } })
          : await tx.permission.create({ data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } });
        const roleCodes = Object.entries(DEFAULT_TENANT_ROLE_GRANTS).filter(([, grants]) => grants.includes(permissionCode)).map(([code]) => code);
        const roles = await tx.tenantRole.findMany({ where: { code: { in: roleCodes }, isSystem: true, isActive: true }, select: { id: true } });
        for (const role of roles) {
          await tx.tenantRolePermission.upsert({ where: { tenantRoleId_permissionId: { tenantRoleId: role.id, permissionId: permission.id } }, create: { tenantRoleId: role.id, permissionId: permission.id }, update: {} });
        }
        await tx.tenantRole.updateMany({ where: { id: { in: roles.map((role) => role.id) } }, data: { permissionsVersion: { increment: 1 } } });
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

void main();
