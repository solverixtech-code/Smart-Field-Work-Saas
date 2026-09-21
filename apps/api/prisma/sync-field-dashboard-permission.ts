import { PrismaClient } from "@prisma/client";
import { DEFAULT_TENANT_ROLE_GRANTS, PERMISSION_REGISTRY, PERMISSION_REGISTRY_VERSION } from "../src/common/security/permission-registry";

const fieldExecutiveCodes = [
  "crm.visits.checkin",
  "crm.leads.access.assigned",
  "crm.pipeline.view",
];

export async function syncFieldDashboardPermission(prisma: PrismaClient) {
  return prisma.$transaction(async (tx) => {
    const permissions = new Map<string, string>();
    for (const code of fieldExecutiveCodes) {
      const definition = PERMISSION_REGISTRY.find((entry) => entry.code === code);
      if (!definition) throw new Error(`${code} is missing from the permission registry.`);
      const existing = await tx.permission.findFirst({
        where: { OR: [{ code }, { moduleKey: definition.moduleKey, action: definition.action }] },
        select: { id: true },
      });
      const permission = existing
        ? await tx.permission.update({ where: { id: existing.id }, data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } })
        : await tx.permission.create({ data: { ...definition, isActive: true, registryVersion: PERMISSION_REGISTRY_VERSION } });
      permissions.set(code, permission.id);
    }

    const roleCodes = Object.entries(DEFAULT_TENANT_ROLE_GRANTS)
      .filter(([, grants]) => grants.some((code) => fieldExecutiveCodes.includes(code)))
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
        const introducedCodes = role.code === "field_executive"
          ? fieldExecutiveCodes
          : ["crm.visits.checkin"];
        const previousDefaults = DEFAULT_TENANT_ROLE_GRANTS[role.code].filter((grant) => !introducedCodes.includes(grant));
        const currentGrants = role.permissions.map((grant) => grant.permission.code)
          .filter((grant): grant is string => grant !== null);
        const unchangedDefaults = currentGrants.length === role.permissions.length &&
          previousDefaults.every((grant) => currentGrants.includes(grant)) &&
          currentGrants.every((grant) => previousDefaults.includes(grant) || introducedCodes.includes(grant));
        if (!unchangedDefaults) continue;
      }
      const granted = new Set(role.permissions.map((grant) => grant.permission.code));
      const missingCodes = fieldExecutiveCodes.filter((code) =>
        DEFAULT_TENANT_ROLE_GRANTS[role.code].includes(code) && !granted.has(code));
      for (const code of missingCodes) {
        const permissionId = permissions.get(code);
        if (!permissionId) throw new Error(`${code} was not synchronized.`);
        await tx.tenantRolePermission.create({
          data: { tenantRoleId: role.id, permissionId },
        });
      }
      if (missingCodes.length) {
        await tx.tenantRole.update({ where: { id: role.id }, data: { permissionsVersion: { increment: 1 } } });
        grantsAdded += missingCodes.length;
      }
    }
    return { permissionCodes: fieldExecutiveCodes, rolesScanned: roles.length, grantsAdded };
  });
}

if (require.main === module) {
  const prisma = new PrismaClient();
  syncFieldDashboardPermission(prisma)
    .then((result) => console.log(result))
    .catch((error: unknown) => { console.error(error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
