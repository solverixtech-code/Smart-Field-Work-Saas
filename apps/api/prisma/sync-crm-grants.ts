import { PrismaClient } from "@prisma/client";
import {
  PERMISSION_REGISTRY,
} from "../src/common/security/permission-registry";
import { RolePermissionService } from "../src/common/security/role-permission.service";

/** Add only approved CRM grants to active built-in administrators, including versioned roles. */
export async function syncCrmAdministratorGrants(prisma: PrismaClient) {
  const grants = new RolePermissionService(prisma);
  let added = 0;
  let cursor: string | undefined;
  const crmPermissions = PERMISSION_REGISTRY.filter(
    (p) => p.scope === "TENANT" && p.code.startsWith("crm."),
  );
  while (true) {
    const roles = await prisma.tenantRole.findMany({
      where: { code: "tenant_admin", isSystem: true, isActive: true },
      select: { id: true, tenantId: true },
      orderBy: { id: "asc" },
      take: 100,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    for (const role of roles) {
      for (const permission of crmPermissions) {
        const result = await grants.grantTenantPermission(
          role.tenantId,
          role.id,
          permission.code,
          true,
        );
        if (result.changed !== false) added++;
      }
    }
    if (roles.length < 100) break;
    cursor = roles[roles.length - 1].id;
  }
  return { added };
}
