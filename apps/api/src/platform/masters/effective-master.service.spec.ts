import { randomUUID } from "crypto";
import { resolveMasterValues } from "./effective-master.service";
import { MASTER_SEED_DEFINITIONS } from "./master-seed-catalog";
import {
  MasterDefinitionRow,
  MasterOverrideRow,
  MasterValueRow,
  createMasterValue,
  masterOverride,
  updateMasterValue,
} from "./master-contract";
import {
  DEFAULT_PLATFORM_ROLE_GRANTS,
  DEFAULT_TENANT_ROLE_GRANTS,
} from "../../common/security/permission-registry";

const definition: MasterDefinitionRow = {
  ...MASTER_SEED_DEFINITIONS[0],
  id: randomUUID(),
  revision: 1,
};
const value: MasterValueRow = {
  id: randomUUID(),
  definitionId: definition.id,
  source: "SYSTEM",
  tenantId: null,
  industryTemplateVersionId: null,
  code: "EXAMPLE",
  name: "System name",
  description: null,
  displayColor: "#112233",
  sortOrder: 10,
  isActive: true,
  revision: 1,
};
const industry: MasterOverrideRow = {
  id: randomUUID(),
  inheritedMasterValueId: value.id,
  scope: "INDUSTRY",
  tenantId: null,
  industryTemplateVersionId: randomUUID(),
  displayName: "Industry name",
  displayColor: "#334455",
  sortOrder: 5,
  isHidden: true,
  revision: 1,
};
const tenant: MasterOverrideRow = {
  ...industry,
  id: randomUUID(),
  scope: "TENANT",
  tenantId: randomUUID(),
  industryTemplateVersionId: null,
  displayName: "Tenant name",
  displayColor: null,
  sortOrder: null,
  isHidden: false,
};

describe("Pure Master layering and contracts", () => {
  it("layers Industry before Tenant regardless of query order and inherits nullable fields", () => {
    const [result] = resolveMasterValues(
      definition,
      [value],
      [tenant, industry],
    );
    expect(result).toMatchObject({
      code: "EXAMPLE",
      name: "Tenant name",
      displayColor: "#334455",
      sortOrder: 5,
      selectable: true,
    });
    expect(result.provenance.overrides.map((o) => o.scope)).toEqual([
      "INDUSTRY",
      "TENANT",
    ]);
    expect(value.name).toBe("System name");
  });
  it("ignores disallowed Industry presentation without removing independent System values", () => {
    expect(
      resolveMasterValues(
        { ...definition, allowIndustryDefaults: false },
        [value],
        [industry],
      )[0],
    ).toMatchObject({ name: "System name", selectable: true });
  });
  it("ignores Tenant edits and hiding after policy tightening", () => {
    expect(
      resolveMasterValues(
        { ...definition, allowTenantEdit: false, allowTenantDeactivate: false },
        [value],
        [{ ...tenant, isHidden: true }],
      )[0],
    ).toMatchObject({ name: "System name", selectable: true });
  });
  it("enforces locked inherited presentation even for existing overrides", () => {
    expect(
      resolveMasterValues(
        { ...definition, systemValuePolicy: "LOCKED_IDENTITY" },
        [value],
        [industry, tenant],
      )[0],
    ).toMatchObject({
      name: "System name",
      selectable: true,
      provenance: { overrides: [] },
    });
  });
  it.each([false, true])(
    "never revives an inactive base through a hidden=%s override",
    (isHidden) => {
      expect(
        resolveMasterValues(
          definition,
          [{ ...value, isActive: false }],
          [{ ...tenant, isHidden }],
        )[0].selectable,
      ).toBe(false);
    },
  );
  it("retains inactive definition rows for historical presentation but not selection", () => {
    expect(
      resolveMasterValues(
        { ...definition, status: "INACTIVE" },
        [value],
        [],
      )[0],
    ).toMatchObject({ code: "EXAMPLE", selectable: false });
  });
  it("fails closed on inherited code collisions rather than silently choosing a winner", () => {
    expect(() =>
      resolveMasterValues(
        definition,
        [value, { ...value, id: randomUUID(), source: "TENANT" }],
        [],
      ),
    ).toThrow("MASTER_INHERITED_CODE_COLLISION");
  });
  it("fails closed on duplicate same-scope overrides", () => {
    expect(() =>
      resolveMasterValues(
        definition,
        [value],
        [tenant, { ...tenant, id: randomUUID() }],
      ),
    ).toThrow("MASTER_DUPLICATE_OVERRIDE");
  });
  it("sorts deterministically by effective order, source rank, then code points", () => {
    const rows: MasterValueRow[] = [
      { ...value, id: randomUUID(), source: "TENANT", code: "LOCAL" },
      { ...value, id: randomUUID(), source: "SYSTEM", code: "ZZ_LAST" },
      { ...value, id: randomUUID(), source: "INDUSTRY", code: "INDUSTRY" },
      { ...value, id: randomUUID(), source: "SYSTEM", code: "AA_FIRST" },
    ];
    expect(
      resolveMasterValues(definition, rows, []).map((v) => v.code),
    ).toEqual(["AA_FIRST", "ZZ_LAST", "INDUSTRY", "LOCAL"]);
    expect(resolveMasterValues(definition, [...rows].reverse(), [])).toEqual(
      resolveMasterValues(definition, rows, []),
    );
  });
  const create = {
    code: "lower_code",
    name: " Label ",
    description: null,
    displayColor: null,
    sortOrder: 0,
    isActive: true,
    reason: "Reviewed change",
  };
  it("normalizes new identities without allowing identity mutation", () => {
    expect(createMasterValue.parse(create)).toMatchObject({
      code: "LOWER_CODE",
      name: "Label",
    });
    expect(
      updateMasterValue.safeParse({ ...create, expectedRevision: 1 }).success,
    ).toBe(false);
  });
  it.each([
    "tenantId",
    "source",
    "definitionId",
    "industryTemplateVersionId",
    "metadata",
    "formula",
    "isMandatory",
  ])("rejects caller-controlled %s", (field) => {
    expect(
      createMasterValue.safeParse({ ...create, [field]: "injected" }).success,
    ).toBe(false);
  });
  it("rejects expressions and invalid override revisions", () => {
    expect(
      masterOverride.safeParse({
        expectedRevision: -1,
        displayName: null,
        displayColor: null,
        sortOrder: null,
        isHidden: true,
        reason: "x",
      }).success,
    ).toBe(false);
  });
  it("adds no Master management to support/operations or non-admin Tenant roles", () => {
    for (const [code, permissions] of Object.entries(
      DEFAULT_PLATFORM_ROLE_GRANTS,
    )) {
      if (code !== "PLATFORM_SUPER_ADMIN")
        expect(permissions).not.toContain("platform.masters.manage");
    }
    for (const [code, permissions] of Object.entries(
      DEFAULT_TENANT_ROLE_GRANTS,
    )) {
      if (code !== "tenant_admin")
        expect(permissions).not.toContain("system.masters.manage");
    }
    expect(DEFAULT_PLATFORM_ROLE_GRANTS.PLATFORM_SUPER_ADMIN).toEqual(
      expect.arrayContaining([
        "platform.masters.view",
        "platform.masters.manage",
      ]),
    );
    expect(DEFAULT_TENANT_ROLE_GRANTS.tenant_admin).toContain(
      "system.masters.manage",
    );
  });
});
