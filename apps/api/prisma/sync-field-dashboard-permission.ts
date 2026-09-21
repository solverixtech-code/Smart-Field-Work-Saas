import { PrismaClient } from "@prisma/client";
import { DEFAULT_TENANT_ROLE_GRANTS, PERMISSION_REGISTRY, PERMISSION_REGISTRY_VERSION } from "../src/common/security/permission-registry";

const code = "crm.visits.checkin";

export async function syncFieldDashboardPermission(prisma: PrismaClient) {
  const definition = PERMISSION_REGISTRY.find((entry) => entry.code === code);
  if (!definition) throw new Error(`${code} is missing from the permission registry.`);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.permission.findFirst({
      where: { OR: [{ code }, { moduleKey: definition.moduleKey, action: definition.action }] },
      select: { id: true },
    });
    const permission = existing
      ? await tx.permission.update({ where: { id: existing.id }, data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } })
      : await tx.permission.create({ data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } });

    const roleCodes = Object.entries(DEFAULT_TENANT_ROLE_GRANTS)
      .filter(([, grants]) => grants.includes(code))
      .map(([roleCode]) => roleCode);
    const roles = await tx.tenantRole.findMany({
      where: { code: { in: roleCodes }, isSystem: true, isActive: true },
      select: {
        id: true, code: true, permissionsVersion: true,
        permissions: { select: { permission: { select: { code: true } } } },
      },
    });
    let grantsAdded = 0;
    for (const role of roles) {
      if (role.code !== "tenant_admin" && role.permissionsVersion > 1) {
        const previousDefaults = DEFAULT_TENANT_ROLE_GRANTS[role.code].filter((grant) => grant !== code);
        const currentGrants = role.permissions.map((grant) => grant.permission.code);
        const unchangedDefaults = currentGrants.length === previousDefaults.length &&
          previousDefaults.every((grant) => currentGrants.includes(grant));
        if (!unchangedDefaults) continue;
      }
      const grant = await tx.tenantRolePermission.findUnique({
        where: { tenantRoleId_permissionId: { tenantRoleId: role.id, permissionId: permission.id } },
        select: { id: true },
      });
      if (grant) continue;
      await tx.tenantRolePermission.create({ data: { tenantRoleId: role.id, permissionId: permission.id } });
      await tx.tenantRole.update({ where: { id: role.id }, data: { permissionsVersion: { increment: 1 } } });
      grantsAdded++;
    }
    return { permissionCode: code, rolesScanned: roles.length, grantsAdded };
  });
}

if (require.main === module) {
  const prisma = new PrismaClient();
  syncFieldDashboardPermission(prisma)
    .then((result) => console.log(result))
    .catch((error: unknown) => { console.error(error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
