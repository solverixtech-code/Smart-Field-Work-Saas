import { z } from 'zod';

export const industryId = z.string().uuid();
const label = z.string().trim().min(1).max(200);
export const industryCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z][A-Z0-9_]{1,63}$/);
export const revisionCommand = z
  .object({
    expectedRevision: z.number().int().positive(),
    reason: z.string().trim().min(1).max(1000),
  })
  .strict();
export const industryMetadata = z
  .object({
    name: label,
    category: label,
    description: z.string().trim().min(1).max(2000),
  })
  .strict();
export const createIndustry = industryMetadata
  .extend({ code: industryCode })
  .strict();
export const updateIndustry = industryMetadata.merge(revisionCommand).strict();
// Versioned, fail-closed seam: reviewed fixtures have no terminology/default keys.
// Nonempty product definitions require a reviewed schema and additive migration.
export const industrySnapshot = z
  .object({
    schemaVersion: z.literal(1),
    terminology: z.object({}).strict(),
    masterDefaults: z.array(z.never()).max(0),
    recommendedModuleCodes: z
      .array(
        z
          .string()
          .trim()
          .regex(/^[a-z][a-z0-9_]+$/),
      )
      .max(100)
      .refine(
        (codes) => new Set(codes).size === codes.length,
        'Duplicate recommended Module',
      )
      .transform((codes) => codes.sort()),
  })
  .strict();
export const updateIndustryDraft = industrySnapshot
  .merge(revisionCommand)
  .strict();
export const publishIndustry = revisionCommand
  .extend({ approvalReference: label })
  .strict();
export const assignIndustry = z
  .object({
    industryTemplateVersionId: industryId,
    reason: z.string().trim().min(1).max(1000),
    requestId: label.optional(),
  })
  .strict();
export const migrateIndustry = assignIndustry
  .extend({ expectedRevision: z.number().int().positive() })
  .strict();
export const industryPage = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(200).optional(),
  })
  .strict();
export const industryMappings = z
  .array(assignIndustry.extend({ tenantId: industryId }).strict())
  .min(1)
  .max(1000)
  .refine(
    (rows) => new Set(rows.map((row) => row.tenantId)).size === rows.length,
    'Duplicate Tenant mapping',
  )
  .transform((rows) =>
    rows.sort((a, b) => a.tenantId.localeCompare(b.tenantId)),
  );
