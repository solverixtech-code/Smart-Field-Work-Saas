import { createHash } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";
import ts from "typescript";
import { z } from "zod";
import { MODULE_REGISTRY } from "../modules/feature-registry";
import {
  MASTER_SEED_DEFINITIONS,
  MASTER_SEED_PROVENANCE,
  MASTER_SEED_VALUES,
} from "./master-seed-catalog";
import {
  reviewApprovedMasterSeed,
  validateMasterSeed,
} from "./master-seed-contract";

const repo = resolve(__dirname, "../../../../..");
const read = (path: string): string =>
  readFileSync(resolve(repo, path), "utf8").replace(/\r\n/g, "\n");
const contract = read("docs/architecture/PHASE_0_8_MASTER_SEED_CONTRACT.md");

function table(section: string): string[][] {
  const start = contract.indexOf(`## ${section}`);
  if (start < 0) throw new Error(`Missing approved section: ${section}`);
  const end = contract.indexOf("\n## ", start + 1);
  return contract
    .slice(start, end < 0 ? undefined : end)
    .split("\n")
    .filter((line) => line.startsWith("| "))
    .slice(2)
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );
}

// Test-only source inspection: production code never loads the web fixture.
function literal(node: ts.Node): unknown {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.map((property) => {
        if (
          !ts.isPropertyAssignment(property) ||
          !ts.isIdentifier(property.name)
        )
          throw new Error("Unreviewed Master fixture property");
        return [property.name.text, literal(property.initializer)];
      }),
    );
  throw new Error("Unreviewed Master fixture expression");
}

function fixtureInitializer(source: ts.SourceFile, name: string): unknown {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations)
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer
      )
        return literal(declaration.initializer);
  }
  throw new Error(`Missing fixture declaration: ${name}`);
}

describe("Owner-approved Master seed and classification provenance", () => {
  const fixtureText = read(
    "apps/web/src/screens/admin/masters/systemMastersData.ts",
  );
  const classificationText = read(
    "docs/architecture/PHASE_0_MASTER_CLASSIFICATION.md",
  );
  const classifications = classificationText
    .split("\n")
    .filter((line) => /^\| `[^`]+` -/.test(line))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .map((row) => ({ code: row[0].split("`")[1], classification: row[2] }));

  it("matches the exact frozen source hashes without executing frontend code", () => {
    const sha = (input: string): string =>
      createHash("sha256").update(input).digest("hex");
    expect(sha(fixtureText)).toBe(MASTER_SEED_PROVENANCE.fixtureGitBlobSha256);
    expect(sha(classificationText)).toBe(
      MASTER_SEED_PROVENANCE.classificationGitBlobSha256,
    );
  });

  it("accounts for all 44 categories and admits exactly the 24 A identities", () => {
    expect(classifications).toHaveLength(44);
    expect(
      Object.fromEntries(
        ["A", "B", "C", "D", "F"].map((kind) => [
          kind,
          classifications.filter((row) => row.classification === kind).length,
        ]),
      ),
    ).toEqual({ A: 24, B: 8, C: 10, D: 1, F: 1 });
    expect(MASTER_SEED_DEFINITIONS.map((row) => row.code).sort()).toEqual(
      classifications
        .filter((row) => row.classification === "A")
        .map((row) => row.code)
        .sort(),
    );
  });

  it("covers all 86 original candidates exactly once and excludes all custom flags", () => {
    const source = ts.createSourceFile(
      "systemMastersData.ts",
      fixtureText,
      ts.ScriptTarget.Latest,
      true,
    );
    const categorySchema = z.array(z.object({ id: z.string() }));
    const recordSchema = z.record(
      z.array(
        z.object({
          category: z.string(),
          code: z.string(),
          name: z.string(),
          description: z.string(),
          isSystemDefault: z.boolean(),
        }),
      ),
    );
    const categories = categorySchema.parse(
      fixtureInitializer(source, "masterCategories"),
    );
    const records = recordSchema.parse(
      fixtureInitializer(source, "initialMasterRecords"),
    );
    expect(categories.map((row) => row.id).sort()).toEqual(
      classifications.map((row) => row.code).sort(),
    );
    expect(Object.keys(records).sort()).toEqual(
      categories.map((row) => row.id).sort(),
    );
    const candidates = table("Candidate value contract");
    const generic = classifications
      .filter((row) => row.classification === "A")
      .flatMap((row) => records[row.code]);
    expect(generic).toHaveLength(86);
    expect(candidates).toHaveLength(generic.length);
    expect(new Set(candidates.map((row) => `${row[0]}/${row[1]}`)).size).toBe(
      86,
    );
    expect(generic.filter((row) => !row.isSystemDefault)).toHaveLength(11);
    for (const original of generic) {
      const row = candidates.find(
        (item) => item[0] === original.category && item[1] === original.code,
      );
      expect(row?.slice(2, 5)).toEqual([
        original.name,
        original.description,
        String(original.isSystemDefault),
      ]);
      expect(["PRODUCTION_SYSTEM", "DEFINITION_ONLY", "DEMO_ONLY"]).toContain(
        row?.[7],
      );
      if (!original.isSystemDefault) expect(row?.[7]).toBe("DEMO_ONLY");
    }
    expect(
      candidates.filter((row) => row[7] === "PRODUCTION_SYSTEM"),
    ).toHaveLength(44);
    expect(
      candidates.filter((row) => row[7] === "DEFINITION_ONLY"),
    ).toHaveLength(29);
    expect(candidates.filter((row) => row[7] === "DEMO_ONLY")).toHaveLength(13);
  });

  it("matches every approved definition field rather than only its code", () => {
    const definitions = table("Definition contract").map((row, index) => ({
      code: row[0],
      name: row[1],
      description: row[2],
      allowTenantCreate: row[3] === "true",
      allowTenantEdit: row[4] === "true",
      allowTenantDeactivate: row[5] === "true",
      allowIndustryDefaults: row[6] === "true",
      systemValuePolicy: row[7],
      moduleCode: row[8] === "NULL" ? null : row[8],
      metadataSchema: row[9],
      valueType: "LABEL",
      status: "ACTIVE",
      displayOrder: index + 1,
    }));
    expect(definitions).toHaveLength(24);
    expect(MASTER_SEED_DEFINITIONS).toEqual(definitions);
  });

  it("matches all 44 proposed production descriptions, labels and display fields", () => {
    const manifest = table("Production presentation manifest");
    expect(manifest).toHaveLength(44);
    const values = table("Candidate value contract")
      .filter((row) => row[7] === "PRODUCTION_SYSTEM")
      .map((row) => {
        const display = manifest.find(
          (entry) => entry[0] === row[0] && entry[1] === row[1],
        );
        if (!display) throw new Error("Missing approved display manifest row");
        return {
          definitionCode: row[0],
          code: row[1],
          name: row[5],
          description: row[6],
          source: "SYSTEM",
          tenantId: null,
          industryTemplateVersionId: null,
          displayColor: display[2] === "NULL" ? null : display[2],
          sortOrder: Number(display[3]),
          isActive: display[4] === "true",
        };
      });
    expect(MASTER_SEED_VALUES).toEqual(values);
    for (const row of table("Candidate value contract").filter(
      (row) => row[7] !== "PRODUCTION_SYSTEM",
    ))
      expect(
        values.some(
          (value) => value.definitionCode === row[0] && value.code === row[1],
        ),
      ).toBe(false);
  });

  it("preserves nine empty categories and closes target metric/scope customization", () => {
    expect(
      MASTER_SEED_DEFINITIONS.filter(
        (definition) =>
          !MASTER_SEED_VALUES.some(
            (value) => value.definitionCode === definition.code,
          ),
      ),
    ).toHaveLength(9);
    const closed = MASTER_SEED_DEFINITIONS.filter(
      (row) => row.systemValuePolicy === "LOCKED_IDENTITY",
    );
    expect(closed.map((row) => row.code)).toEqual([
      "target_metric_type",
      "target_type",
    ]);
    for (const definition of closed) {
      expect(definition.allowTenantCreate).toBe(false);
      expect(definition.allowTenantEdit).toBe(false);
      expect(definition.allowTenantDeactivate).toBe(false);
      expect(definition.allowIndustryDefaults).toBe(false);
    }
  });

  it("uses only exact canonical Module bindings and leaves six explicitly unbound", () => {
    expect(
      MASTER_SEED_DEFINITIONS.filter((row) => row.moduleCode === null),
    ).toHaveLength(6);
    for (const row of MASTER_SEED_DEFINITIONS)
      if (row.moduleCode !== null)
        expect(
          MODULE_REGISTRY.some((module) => module.code === row.moduleCode),
        ).toBe(true);
  });

  it("returns independent validated snapshots with a deterministic review hash", () => {
    const first = reviewApprovedMasterSeed();
    expect(first.reviewedHash).toMatch(/^[a-f0-9]{64}$/);
    const reordered = {
      ...first.seed,
      definitions: [...first.seed.definitions].reverse(),
      values: [...first.seed.values].reverse(),
    };
    expect(validateMasterSeed(reordered)).toEqual(first.seed);
    first.seed.values[0].name = "Caller edit";
    expect(reviewApprovedMasterSeed().seed.values[0].name).not.toBe(
      "Caller edit",
    );
    expect(reviewApprovedMasterSeed().reviewedHash).toBe(first.reviewedHash);
  });

  it.each([
    ["unknown code", { code: "INVENTED" }],
    ["demo code", { code: "LOP_PENALTY" }],
    ["changed description", { description: "Owner-edited description" }],
    ["unsafe description", { description: "Apply after 3 attempts" }],
    ["changed label", { name: "Different label" }],
    ["changed order", { sortOrder: 999 }],
    ["inactive default", { isActive: false }],
    ["CSS injection", { displayColor: "url(example)" }],
    ["metadata formula", { metadataJson: { formula: "amount * 2" } }],
    ["commercial grant", { moduleGrants: ["payroll"] }],
    ["tenant source", { source: "TENANT" }],
    ["industry source", { source: "INDUSTRY" }],
    ["tenant owner", { tenantId: "known-tenant" }],
    ["industry owner", { industryTemplateVersionId: "known-version" }],
    ["orphan value", { definitionCode: "not_registered" }],
  ])("rejects %s without partially accepting a seed", (_name, patch) => {
    const { seed } = reviewApprovedMasterSeed();
    expect(() =>
      validateMasterSeed({
        ...seed,
        values: [{ ...seed.values[0], ...patch }, ...seed.values.slice(1)],
      }),
    ).toThrow();
  });

  it.each([
    "team",
    "lead_stage",
    "territory",
    "product_category",
    "market_hub",
    "merchant_status",
    "subscription_plan",
    "shift_type",
    "target_status",
  ])("rejects non-Generic definition %s", (code) => {
    const { seed } = reviewApprovedMasterSeed();
    expect(() =>
      validateMasterSeed({
        ...seed,
        definitions: [
          { ...seed.definitions[0], code },
          ...seed.definitions.slice(1),
        ],
      }),
    ).toThrow();
  });

  it.each([
    ["unknown module", { moduleCode: "workforce" }],
    ["guessed module", { moduleCode: "core_crm" }],
    ["changed permission", { allowTenantCreate: false }],
    ["arbitrary metadata", { metadataSchema: { fields: ["formula"] } }],
    ["unknown field", { enabled: true }],
  ])("rejects definition drift: %s", (_name, patch) => {
    const { seed } = reviewApprovedMasterSeed();
    // designation is deliberately unbound and allows Tenant creation.
    expect(() =>
      validateMasterSeed({
        ...seed,
        definitions: seed.definitions.map((row) =>
          row.code === "designation" ? { ...row, ...patch } : row,
        ),
      }),
    ).toThrow();
  });

  it("rejects duplicate, missing and additional identities and altered provenance", () => {
    const { seed } = reviewApprovedMasterSeed();
    for (const input of [
      {
        ...seed,
        definitions: [seed.definitions[0], ...seed.definitions.slice(0, -1)],
      },
      { ...seed, values: [seed.values[0], ...seed.values.slice(0, -1)] },
      { ...seed, values: seed.values.slice(1) },
      { ...seed, values: [...seed.values, seed.values[0]] },
      { ...seed, provenance: { ...seed.provenance, contractRevision: 2 } },
      {
        ...seed,
        provenance: { ...seed.provenance, fixtureGitBlobSha256: "unreviewed" },
      },
      { ...seed, industryValues: [] },
    ])
      expect(() => validateMasterSeed(input)).toThrow();
  });
});
