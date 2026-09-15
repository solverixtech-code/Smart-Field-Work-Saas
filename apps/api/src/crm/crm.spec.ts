import { randomUUID } from "crypto";
import { CrmPolicy } from "./crm-policy";
import {
  accountQuery,
  createAccount,
  createContact,
  updateContact,
  revisionCommand,
} from "./crm-contract";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import {
  CRM_PHASE_1_1_PERMISSIONS,
  DEFAULT_TENANT_ROLE_GRANTS,
  PERMISSION_REGISTRY,
} from "../common/security/permission-registry";
const actor: RequestPrincipal = {
  userId: randomUUID(),
  sessionId: randomUUID(),
  tenantId: randomUUID(),
  membershipId: randomUUID(),
  tenantRoleCode: "tenant_admin",
  tenantPermissions: [],
  platformPermissions: ["crm.businesses.access.tenant"],
  platformRoleCodes: ["PLATFORM_SUPER_ADMIN"],
  permissions: ["crm.businesses.access.tenant"],
  dataScope: "TENANT",
  contextVersion: 1,
  permissionVersion: { tenant: null, platform: null },
  isPlatformOnly: false,
};
describe("CRM strict contracts and explicit record authority", () => {
  it.each([
    "tenantId",
    "createdAt",
    "createdByMembershipId",
    "contacts",
    "revision",
    "unknown",
  ])("rejects server or unknown Account field %s", (key) =>
    expect(
      createAccount.safeParse({ name: "Business", [key]: randomUUID() })
        .success,
    ).toBe(false),
  );
  it.each([
    { name: "Person" },
    { name: "Person", phone: "123" },
    { name: "Person", email: "bad" },
    {
      name: "Person",
      phone: "+919876543210",
      accountId: randomUUID(),
      ownerMembershipId: randomUUID(),
    },
  ])("rejects invalid Contact creation %#", (body) =>
    expect(createContact.safeParse(body).success).toBe(false),
  );
  it("normalizes phone and trims without inventing missing fields", () =>
    expect(
      createContact.parse({ name: " Person ", phone: "+91 (98765) 43210" }),
    ).toEqual({ name: "Person", phone: "+919876543210" }));
  it.each(["accountId", "isPrimary", "tenantId"])(
    "rejects Contact structural patch %s",
    (key) =>
      expect(
        updateContact.safeParse({ expectedRevision: 1, [key]: randomUUID() })
          .success,
      ).toBe(false),
  );
  it.each([0, -1, 1.5, "1", null, 2147483648])(
    "rejects invalid revision %s",
    (expectedRevision) =>
      expect(revisionCommand.safeParse({ expectedRevision }).success).toBe(
        false,
      ),
  );
  it("bounds pagination and rejects arbitrary sorts", () => {
    expect(accountQuery.parse({})).toMatchObject({ page: 1, limit: 25 });
    expect(accountQuery.safeParse({ limit: 101 }).success).toBe(false);
    expect(accountQuery.safeParse({ sortBy: "passwordHash" }).success).toBe(
      false,
    );
  });
  it("never infers scope from role, union permissions, platform permissions or legacy dataScope", () =>
    expect(() => new CrmPolicy(actor).accounts()).toThrow(
      "CRM_SCOPE_REQUIRED",
    ));
  it("own policy always includes tenant, undeleted and membership", () =>
    expect(
      new CrmPolicy({
        ...actor,
        tenantPermissions: ["crm.businesses.access.own"],
      }).accounts(),
    ).toEqual({
      tenantId: actor.tenantId,
      deletedAt: null,
      ownerMembershipId: actor.membershipId,
    }));
  it("tenant scope requires its exact grant", () =>
    expect(
      new CrmPolicy({
        ...actor,
        tenantPermissions: ["crm.businesses.access.tenant"],
      }).accounts(),
    ).toEqual({ tenantId: actor.tenantId, deletedAt: null }));
  it("linked Contact policy inherits the visible Account predicate", () => {
    const p = new CrmPolicy({
      ...actor,
      tenantPermissions: [
        "crm.businesses.view",
        "crm.businesses.access.tenant",
        "crm.contacts.access.own",
      ],
    });
    expect(p.contacts().OR).toContainEqual({ account: { is: p.accounts() } });
  });
  it("registry identities are unique and only admin receives new defaults", () => {
    expect(
      new Set(PERMISSION_REGISTRY.map((p) => `${p.moduleKey}:${p.action}`))
        .size,
    ).toBe(PERMISSION_REGISTRY.length);
    for (const [role, grants] of Object.entries(DEFAULT_TENANT_ROLE_GRANTS)) {
      for (const permission of CRM_PHASE_1_1_PERMISSIONS)
        expect(grants.includes(permission.code)).toBe(role === "tenant_admin");
    }
  });
});
