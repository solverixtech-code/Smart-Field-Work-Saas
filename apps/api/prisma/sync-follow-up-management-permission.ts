import { PrismaClient } from "@prisma/client";
import {
  PERMISSION_REGISTRY,
  PERMISSION_REGISTRY_VERSION,
} from "../src/common/security/permission-registry";

const code = "crm.followups.manage";

export async function syncFollowUpManagementPermission(prisma: PrismaClient) {
  const definition = PERMISSION_REGISTRY.find((entry) => entry.code === code);
  if (!definition) throw new Error(`${code} is missing from the permission registry.`);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.permission.findFirst({
      where: {
        OR: [
          { code },
          { moduleKey: definition.moduleKey, action: definition.action },
        ],
      },
      select: { id: true },
    });
    const permission = existing
      ? await tx.permission.update({
          where: { id: existing.id },
          data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION },
        })
      : await tx.permission.create({
          data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION },
        });

    const roles = await tx.tenantRole.findMany({
      where: {
        code: { in: ["tenant_admin", "field_executive"] },
        isSystem: true,
        isActive: true,
      },
      select: {
        id: true,
        permissions: {
          where: { permissionId: permission.id },
          select: { id: true },
        },
      },
    });
    let grantsAdded = 0;
    for (const role of roles) {
      if (role.permissions.length) continue;
      await tx.tenantRolePermission.create({
        data: { tenantRoleId: role.id, permissionId: permission.id },
      });
      await tx.tenantRole.update({
        where: { id: role.id },
        data: { permissionsVersion: { increment: 1 } },
      });
      grantsAdded++;
    }
    return { permissionCode: code, rolesScanned: roles.length, grantsAdded };
  });
}

if (require.main === module) {
  const prisma = new PrismaClient();
  syncFollowUpManagementPermission(prisma)
    .then((result) => console.log(result))
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
