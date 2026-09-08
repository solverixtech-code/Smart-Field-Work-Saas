import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { MODULE_REGISTRY } from "../platform/modules/feature-registry";

const text: SchemaObject = { type: "string" };
const id: SchemaObject = { type: "string", format: "uuid" };
const bool: SchemaObject = { type: "boolean" };
const integer: SchemaObject = { type: "integer" };
const object = (properties: Record<string, SchemaObject>): SchemaObject => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});
export const RUNTIME_OPENAPI_SCHEMA: SchemaObject = object({
  schemaVersion: { type: "integer", enum: [1] },
  configVersion: { type: "string", pattern: "^cfg1_[a-f0-9]{64}$" },
  generatedAt: { type: "string", format: "date-time" },
  nextRevalidationAt: { type: "string", format: "date-time", nullable: true },
  principal: object({ userId: id, membershipId: id, tenantId: id }),
  tenant: object({
    id,
    displayName: text,
    status: { type: "string", enum: ["ACTIVE"] },
  }),
  access: object({
    mode: { type: "string", enum: ["FULL", "READ_ONLY"] },
    mapping: { type: "string", enum: ["SUBSCRIBED", "LEGACY_UNMAPPED"] },
    subscriptionStatus: {
      type: "string",
      enum: ["ACTIVE", "TRIALING", "PAST_DUE", "GRACE"],
      nullable: true,
    },
    planVersionId: { ...id, nullable: true },
  }),
  modules: {
    type: "array",
    maxItems: MODULE_REGISTRY.length,
    items: object({
      code: text,
      status: { type: "string", enum: ["ACTIVE", "BETA"] },
      source: { type: "string", enum: ["PLAN_VERSION"] },
    }),
  },
  industry: {
    ...object({ templateId: id, versionId: id, version: integer }),
    nullable: true,
  },
  settings: object({
    timezone: text,
    currency: text,
    locale: text,
    language: text,
    dateFormat: text,
    weekStartDay: text,
    financialYearStartMonth: { type: "integer", minimum: 1, maximum: 12 },
  }),
  settingsProvenance: { type: "string", enum: ["SYSTEM", "TENANT"] },
  permissions: { type: "array", maxItems: 1000, items: text },
  masters: object({
    strategy: { type: "string", enum: ["MANIFEST"] },
    canRead: bool,
    canManage: bool,
    definitions: {
      type: "array",
      maxItems: 24,
      items: object({
        id,
        code: text,
        name: text,
        description: text,
        moduleCode: { ...text, nullable: true },
        valueType: { type: "string", enum: ["LABEL"] },
        metadataSchema: { type: "string", enum: ["NONE"] },
        allowTenantCreate: bool,
        allowTenantEdit: bool,
        allowTenantDeactivate: bool,
        allowIndustryDefaults: bool,
        systemValuePolicy: {
          type: "string",
          enum: ["OVERRIDABLE_LABEL", "LOCKED_IDENTITY"],
        },
        displayOrder: integer,
        status: { type: "string", enum: ["ACTIVE"] },
        revision: integer,
      }),
    },
  }),
});
