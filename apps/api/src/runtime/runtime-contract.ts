import { ServiceUnavailableException } from "@nestjs/common";
import { z } from "zod";
import { payloadHash } from "../platform/subscriptions/subscription-contract";
import { MODULE_REGISTRY } from "../platform/modules/feature-registry";
import { TenantSettingsInputDto } from "../platform/tenants/dto/create-tenant-foundation.dto";

// Same concrete defaults as the frozen Tenant foundation. No frontend fixture input.
export const SYSTEM_RUNTIME_SETTINGS = Object.freeze({
  ...new TenantSettingsInputDto(),
});
const scalar = z.string().min(1).max(200);
export const runtimeSettingsSchema = z
  .object({
    timezone: scalar.refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }),
    currency: z.string().regex(/^[A-Z]{3}$/),
    locale: scalar,
    language: scalar,
    dateFormat: scalar,
    weekStartDay: scalar,
    financialYearStartMonth: z.number().int().min(1).max(12),
  })
  .strict();
export const runtimeSettingsSelect = {
  timezone: true,
  currency: true,
  locale: true,
  language: true,
  dateFormat: true,
  weekStartDay: true,
  financialYearStartMonth: true,
} as const;
export function resolveRuntimeSettings(
  tenant: unknown,
  industry: unknown = {},
) {
  if (!z.object({}).strict().safeParse(industry).success)
    throw new ServiceUnavailableException("RUNTIME_CONFIG_SOURCE_INVALID");
  const parsed = runtimeSettingsSchema.safeParse(
    tenant === null ? SYSTEM_RUNTIME_SETTINGS : tenant,
  );
  if (!parsed.success)
    throw new ServiceUnavailableException("RUNTIME_CONFIG_SOURCE_INVALID");
  return {
    settings: parsed.data,
    settingsProvenance:
      tenant === null ? ("SYSTEM" as const) : ("TENANT" as const),
  };
}

const id = z.string().uuid();
const orderedStrings = z
  .array(z.string().min(1).max(200))
  .max(1000)
  .refine((values) => values.every((v, i) => i === 0 || values[i - 1] < v));
export const runtimeMasterSchema = z
  .object({
    id,
    code: scalar,
    name: scalar,
    description: z.string().max(2000),
    moduleCode: scalar.nullable(),
    valueType: z.literal("LABEL"),
    metadataSchema: z.literal("NONE"),
    allowTenantCreate: z.boolean(),
    allowTenantEdit: z.boolean(),
    allowTenantDeactivate: z.boolean(),
    allowIndustryDefaults: z.boolean(),
    systemValuePolicy: z.enum(["OVERRIDABLE_LABEL", "LOCKED_IDENTITY"]),
    displayOrder: z.number().int().nonnegative(),
    status: z.literal("ACTIVE"),
    revision: z.number().int().positive(),
  })
  .strict();
export const runtimeBootstrapSchema = z
  .object({
    schemaVersion: z.literal(1),
    configVersion: z.string().regex(/^cfg1_[a-f0-9]{64}$/),
    generatedAt: z.string().datetime(),
    nextRevalidationAt: z.string().datetime().nullable(),
    principal: z
      .object({ userId: id, membershipId: id, tenantId: id })
      .strict(),
    tenant: z
      .object({
        id,
        displayName: scalar,
        status: z.literal("ACTIVE"),
        industryCode: z.string().nullable().optional(),
        websiteUrl: z.string().nullable().optional(),
      }),
    access: z
      .object({
        mode: z.enum(["FULL", "READ_ONLY"]),
        mapping: z.enum(["SUBSCRIBED", "LEGACY_UNMAPPED"]),
        subscriptionStatus: z
          .enum(["ACTIVE", "TRIALING", "PAST_DUE", "GRACE"])
          .nullable(),
        planVersionId: id.nullable(),
      })
      .strict(),
    modules: z
      .array(
        z
          .object({
            code: scalar,
            status: z.enum(["ACTIVE", "BETA"]),
            source: z.literal("PLAN_VERSION"),
          })
          .strict(),
      )
      .max(MODULE_REGISTRY.length),
    industry: z
      .object({
        templateId: id,
        versionId: id,
        version: z.number().int().positive(),
      })
      .strict()
      .nullable(),
    settings: runtimeSettingsSchema,
    settingsProvenance: z.enum(["SYSTEM", "TENANT"]),
    permissions: orderedStrings,
    masters: z
      .object({
        strategy: z.literal("MANIFEST"),
        canRead: z.boolean(),
        canManage: z.boolean(),
        definitions: z.array(runtimeMasterSchema).max(24),
      })
      .strict(),
  })
  .strict();
export type RuntimeBootstrap = z.infer<typeof runtimeBootstrapSchema>;
export const RUNTIME_MAX_BYTES = 128 * 1024;
export const RUNTIME_MAX_ENTRIES = 256;
export const RUNTIME_TTL_MS = 60000;
// Explicit semantic implementation revision must advance when composition semantics change.
export const RUNTIME_CODE_VERSION = payloadHash({
  revision: 1,
  defaults: SYSTEM_RUNTIME_SETTINGS,
  modules: MODULE_REGISTRY.map((m) => ({
    code: m.code,
    status: m.status,
    dependencies: m.dependencyCodes ?? [],
  })),
});
export interface RuntimeVersionVector {
  readonly schema: 1;
  readonly code: string;
  readonly tenantId: string;
  readonly membershipId: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly contextVersion: number;
  readonly epochs: readonly {
    readonly id: string;
    readonly scope: string;
    readonly version: string;
  }[];
  readonly subscription: {
    readonly id: string;
    readonly revision: number;
    readonly planVersionId: string;
    readonly mode: string;
  } | null;
  readonly industry: {
    readonly assignmentId: string;
    readonly revision: number;
    readonly versionId: string;
  } | null;
  readonly accessMode: string;
  readonly nextBoundary: string | null;
}
export function configVersion(vector: RuntimeVersionVector): string {
  return `cfg1_${payloadHash(vector)}`;
}
export function runtimeCacheKey(
  value: Pick<RuntimeBootstrap, "principal" | "configVersion">,
): string {
  return `runtime:v1:${value.principal.tenantId}:${value.principal.membershipId}:${value.principal.userId}:${value.configVersion}`;
}
export function validateBootstrap(value: unknown): RuntimeBootstrap {
  const parsed = runtimeBootstrapSchema.safeParse(value);
  if (!parsed.success)
    throw new ServiceUnavailableException("RUNTIME_CONFIG_SOURCE_INVALID");
  if (
    Buffer.byteLength(JSON.stringify(parsed.data), "utf8") > RUNTIME_MAX_BYTES
  )
    throw new ServiceUnavailableException("RUNTIME_CONFIG_LIMIT_EXCEEDED");
  return parsed.data;
}
// Review gate: all semantic top-level fields name their actual dependency dimensions.
export const RUNTIME_SOURCE_DEPENDENCIES = {
  schemaVersion: ["schema"],
  configVersion: ["all"],
  nextRevalidationAt: ["subscription", "nextBoundary"],
  principal: [
    "tenantId",
    "membershipId",
    "userId",
    "sessionId",
    "contextVersion",
  ],
  tenant: ["epochs"],
  access: ["subscription", "accessMode"],
  modules: ["subscription", "code", "epochs"],
  industry: ["industry", "epochs"],
  settings: ["code", "epochs"],
  settingsProvenance: ["code", "epochs"],
  permissions: ["membershipId", "epochs"],
  masters: [
    "code",
    "epochs",
    "subscription",
    "industry",
    "membershipId",
    "accessMode",
  ],
} as const;
