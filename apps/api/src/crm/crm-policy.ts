import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { TenantScopeFactory } from "../common/tenancy/tenant-scope";
import { CrmResource } from "./crm-contract";

export class CrmPolicy {
  readonly scope: ReturnType<typeof TenantScopeFactory.fromPrincipal>;
  constructor(readonly principal: RequestPrincipal) {
    this.scope = TenantScopeFactory.fromPrincipal(principal);
  }
  has(permission: string) {
    return this.principal.tenantPermissions.includes(permission);
  }
  require(permission: string) {
    if (!this.has(permission))
      throw new ForbiddenException("CRM_PERMISSION_DENIED");
  }
  hasScope(resource: CrmResource) {
    return (
      this.has(`crm.${resource}.access.tenant`) ||
      this.has(`crm.${resource}.access.own`)
    );
  }
  requireScope(resource: CrmResource) {
    if (!this.hasScope(resource))
      throw new ForbiddenException("CRM_SCOPE_REQUIRED");
  }
  accounts(): Prisma.AccountWhereInput {
    this.requireScope("businesses");
    return {
      tenantId: this.scope.tenantId,
      deletedAt: null,
      ...(this.has("crm.businesses.access.tenant")
        ? {}
        : { ownerMembershipId: this.scope.membershipId }),
    };
  }
  contacts(): Prisma.ContactWhereInput {
    this.requireScope("contacts");
    const standalone: Prisma.ContactWhereInput = {
      accountId: null,
      ...(this.has("crm.contacts.access.tenant")
        ? {}
        : { ownerMembershipId: this.scope.membershipId }),
    };
    const linked: Prisma.ContactWhereInput[] =
      this.hasScope("businesses") && this.has("crm.businesses.view")
        ? [{ account: { is: this.accounts() } }]
        : [];
    return {
      tenantId: this.scope.tenantId,
      deletedAt: null,
      OR: [standalone, ...linked],
    };
  }
  canSeeContacts() {
    return this.has("crm.contacts.view") && this.hasScope("contacts");
  }
  targetOwner(resource: CrmResource, owner: string) {
    this.requireScope(resource);
    if (owner !== this.scope.membershipId) {
      this.require(`crm.${resource}.assign`);
    }
  }
}
