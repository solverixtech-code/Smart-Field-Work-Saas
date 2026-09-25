import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_TENANT_ROLE_GRANTS,
  PERMISSION_REGISTRY,
  PERMISSION_REGISTRY_VERSION,
} from "../src/common/security/permission-registry";

const permissionCode = "crm.demos.manage";

export async function syncDemoManagementPermission(prisma: PrismaClient) {
  return prisma.$transaction(async (tx) => {
    const definition = PERMISSION_REGISTRY.find((entry) => entry.code === permissionCode);
    if (!definition) throw new Error(`${permissionCode} is missing from the registry.`);
    const existing = await tx.permission.findFirst({
      where: { OR: [{ code: permissionCode }, { moduleKey: definition.moduleKey, action: definition.action }] },
      select: { id: true },
    });
    const permission = existing
      ? await tx.permission.update({ where: { id: existing.id }, data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } })
      : await tx.permission.create({ data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } });
    const roleCodes = Object.entries(DEFAULT_TENANT_ROLE_GRANTS).filter(([, grants]) => grants.includes(permissionCode)).map(([code]) => code);
    const roles = await tx.tenantRole.findMany({ where: { code: { in: roleCodes }, isSystem: true, isActive: true }, select: { id: true } });
    let grantsAdded = 0;
    for (const role of roles) {
      const grant = await tx.tenantRolePermission.findUnique({ where: { tenantRoleId_permissionId: { tenantRoleId: role.id, permissionId: permission.id } } });
      if (grant) continue;
      await tx.tenantRolePermission.create({ data: { tenantRoleId: role.id, permissionId: permission.id } });
      await tx.tenantRole.update({ where: { id: role.id }, data: { permissionsVersion: { increment: 1 } } });
      grantsAdded += 1;
    }
    return { permissionCode, rolesScanned: roles.length, grantsAdded };
  });
}

if (require.main === module) {
  const prisma = new PrismaClient();
  syncDemoManagementPermission(prisma)
    .then((result) => console.log(result))
    .catch((error: unknown) => { console.error(error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
