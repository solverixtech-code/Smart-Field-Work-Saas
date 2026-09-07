import { z } from "zod";
import { MODULE_REGISTRY } from "../modules/feature-registry";
import { payloadHash } from "../subscriptions/subscription-contract";
import {
  MASTER_SEED_DEFINITIONS,
  MASTER_SEED_PROVENANCE,
  MASTER_SEED_VALUES,
} from "./master-seed-catalog";

const code = z.string().regex(/^[a-z][a-z0-9_]{1,63}$/);
const label = z.string().min(1).max(200);
const canonicalModules = new Set(MODULE_REGISTRY.map((entry) => entry.code));

// Strict seed input, not a tenant command or an arbitrary definition-create API.
const definitionSchema = z
  .object({
    code,
    name: label,
    description: z.string().min(1).max(2000),
    allowTenantCreate: z.boolean(),
    allowTenantEdit: z.boolean(),
    allowTenantDeactivate: z.boolean(),
    allowIndustryDefaults: z.boolean(),
    systemValuePolicy: z.enum(["OVERRIDABLE_LABEL", "LOCKED_IDENTITY"]),
    moduleCode: code
      .refine(
        (value) => canonicalModules.has(value),
        "Unknown canonical Module",
      )
      .nullable(),
    metadataSchema: z.literal("NONE"),
    valueType: z.literal("LABEL"),
    status: z.literal("ACTIVE"),
    displayOrder: z.number().int().min(1).max(2147483647),
  })
  .strict();

const valueSchema = z
  .object({
    definitionCode: code,
    code: z.string().regex(/^[A-Z][A-Z0-9_]{1,63}$/),
    name: label,
    description: z.string().min(1).max(2000),
    source: z.literal("SYSTEM"),
    tenantId: z.null(),
    industryTemplateVersionId: z.null(),
    displayColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .nullable(),
    sortOrder: z.number().int().min(0).max(2147483647),
    isActive: z.boolean(),
  })
  .strict();

const provenanceSchema = z
  .object({
    contractRevision: z.literal(MASTER_SEED_PROVENANCE.contractRevision),
    approvedBaseline: z.literal(MASTER_SEED_PROVENANCE.approvedBaseline),
    fixtureGitBlobSha256: z.literal(
      MASTER_SEED_PROVENANCE.fixtureGitBlobSha256,
    ),
    classificationGitBlobSha256: z.literal(
      MASTER_SEED_PROVENANCE.classificationGitBlobSha256,
    ),
    expectedDefinitionCount: z.literal(24),
    expectedSystemValueCount: z.literal(44),
  })
  .strict();

const seedSchema = z
  .object({
    provenance: provenanceSchema,
    definitions: z.array(definitionSchema).length(24),
    values: z.array(valueSchema).length(44),
  })
  .strict();

export type MasterSeed = z.infer<typeof seedSchema>;

// Code-point ordering avoids locale-dependent ordering of commercial review hashes.
function compareCode(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalSeed(seed: MasterSeed): MasterSeed {
  return {
    provenance: seed.provenance,
    definitions: [...seed.definitions].sort((a, b) =>
      compareCode(a.code, b.code),
    ),
    values: [...seed.values].sort(
      (a, b) =>
        compareCode(a.definitionCode, b.definitionCode) ||
        compareCode(a.code, b.code),
    ),
  };
}

function catalog(): MasterSeed {
  return canonicalSeed(
    seedSchema.parse({
      provenance: MASTER_SEED_PROVENANCE,
      definitions: MASTER_SEED_DEFINITIONS,
      values: MASTER_SEED_VALUES,
    }),
  );
}

/** Validate an exact approved payload; no best-effort import or silent exclusions. */
export function validateMasterSeed(input: unknown): MasterSeed {
  const seed = canonicalSeed(seedSchema.parse(input));
  const definitionCodes = new Set(seed.definitions.map((entry) => entry.code));
  const valueCodes = new Set(
    seed.values.map((entry) => `${entry.definitionCode}/${entry.code}`),
  );
  if (definitionCodes.size !== 24 || valueCodes.size !== 44)
    throw new Error("Duplicate Master seed identity");
  if (seed.values.some((entry) => !definitionCodes.has(entry.definitionCode)))
    throw new Error("Master seed value has no approved definition");
  if (payloadHash(seed) !== payloadHash(catalog()))
    throw new Error(
      "Master seed differs from owner-approved contract revision 1",
    );
  return seed;
}

/** Pure review artifact. Database writes and actor authorization are deliberately separate. */
export function reviewApprovedMasterSeed(): {
  seed: MasterSeed;
  reviewedHash: string;
} {
  const seed = validateMasterSeed(catalog());
  return { seed, reviewedHash: payloadHash(seed) };
}
