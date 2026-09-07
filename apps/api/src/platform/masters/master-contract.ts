import { Prisma } from "@prisma/client";
import { z } from "zod";
import { MASTER_SEED_DEFINITIONS } from "./master-seed-catalog";
import { MODULE_REGISTRY } from "../modules/feature-registry";

export const masterId = z.string().uuid();
export const masterCode = z
  .string()
  .refine(
    (code) => MASTER_SEED_DEFINITIONS.some((d) => d.code === code),
    "Unknown approved Master definition",
  );
const label = z.string().trim().min(1).max(200);
const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable();
const order = z.number().int().min(0).max(2147483647);
export const masterReason = z
  .object({
    reason: z.string().trim().min(1).max(1000),
    requestId: label.optional(),
  })
  .strict();
export const masterRevision = masterReason
  .extend({ expectedRevision: z.number().int().positive() })
  .strict();
export const masterLabel = z
  .object({
    name: label,
    description: z.string().trim().max(2000).nullable(),
    displayColor: color,
    sortOrder: order,
    isActive: z.boolean(),
  })
  .strict();
export const createMasterValue = masterLabel
  .merge(masterReason)
  .extend({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z][A-Z0-9_]{1,63}$/),
  })
  .strict();
export const updateMasterValue = masterLabel.merge(masterRevision).strict();
export const masterOverride = masterReason
  .extend({
    expectedRevision: z.number().int().min(0), // 0 = create; positive = exact existing revision.
    displayName: label.nullable(),
    displayColor: color,
    sortOrder: order.nullable(),
    isHidden: z.boolean(),
  })
  .strict();
export const updateMasterDefinition = masterRevision
  .extend({
    name: label,
    description: z.string().trim().min(1).max(2000),
    moduleCode: z
      .string()
      .refine(
        (code) => MODULE_REGISTRY.some((m) => m.code === code),
        "Unknown canonical Module",
      )
      .nullable(),
    allowTenantCreate: z.boolean(),
    allowTenantEdit: z.boolean(),
    allowTenantDeactivate: z.boolean(),
    allowIndustryDefaults: z.boolean(),
    systemValuePolicy: z.enum(["OVERRIDABLE_LABEL", "LOCKED_IDENTITY"]),
    displayOrder: order,
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .strict();
export const masterPage = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(200).default(""),
  })
  .strict();

export type MasterScope =
  | { readonly kind: "SYSTEM" }
  | { readonly kind: "INDUSTRY"; readonly versionId: string }
  | { readonly kind: "TENANT"; readonly tenantId: string };
export function valueScope(scope: MasterScope): Prisma.MasterValueWhereInput {
  switch (scope.kind) {
    case "SYSTEM":
      return {
        source: "SYSTEM",
        tenantId: null,
        industryTemplateVersionId: null,
      };
    case "INDUSTRY":
      return {
        source: "INDUSTRY",
        tenantId: null,
        industryTemplateVersionId: masterId.parse(scope.versionId),
      };
    case "TENANT":
      return {
        source: "TENANT",
        tenantId: masterId.parse(scope.tenantId),
        industryTemplateVersionId: null,
      };
  }
}
export function overrideScope(
  scope: Exclude<MasterScope, { kind: "SYSTEM" }>,
): Prisma.MasterValueOverrideWhereInput {
  return scope.kind === "TENANT"
    ? {
        scope: "TENANT",
        tenantId: masterId.parse(scope.tenantId),
        industryTemplateVersionId: null,
      }
    : {
        scope: "INDUSTRY",
        tenantId: null,
        industryTemplateVersionId: masterId.parse(scope.versionId),
      };
}
export const masterDefinitionSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  moduleCode: true,
  valueType: true,
  metadataSchema: true,
  allowTenantCreate: true,
  allowTenantEdit: true,
  allowTenantDeactivate: true,
  allowIndustryDefaults: true,
  systemValuePolicy: true,
  displayOrder: true,
  status: true,
  revision: true,
} satisfies Prisma.MasterDefinitionSelect;
export const masterValueSelect = {
  id: true,
  definitionId: true,
  source: true,
  tenantId: true,
  industryTemplateVersionId: true,
  code: true,
  name: true,
  description: true,
  displayColor: true,
  sortOrder: true,
  isActive: true,
  revision: true,
} satisfies Prisma.MasterValueSelect;
export const masterOverrideSelect = {
  id: true,
  inheritedMasterValueId: true,
  scope: true,
  tenantId: true,
  industryTemplateVersionId: true,
  displayName: true,
  displayColor: true,
  sortOrder: true,
  isHidden: true,
  revision: true,
} satisfies Prisma.MasterValueOverrideSelect;
export type MasterDefinitionRow = Prisma.MasterDefinitionGetPayload<{
  select: typeof masterDefinitionSelect;
}>;
export type MasterValueRow = Prisma.MasterValueGetPayload<{
  select: typeof masterValueSelect;
}>;
export type MasterOverrideRow = Prisma.MasterValueOverrideGetPayload<{
  select: typeof masterOverrideSelect;
}>;
