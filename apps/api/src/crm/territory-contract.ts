import { z } from "zod";
import { crmId, revisionCommand } from "./crm-contract";
import { masterPage } from "../platform/masters/master-contract";

export const coordinatePoint = z.tuple([
  z.number().min(-90).max(90),
  z.number().min(-180).max(180),
]);

export const boundaryPathSchema = z
  .array(coordinatePoint)
  .max(500, "Maximum 500 polygon boundary vertices allowed");

export const territoryStatus = z.enum(["ACTIVE", "INACTIVE"]);

export const territoryFields = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  code: z.string().trim().min(1).max(50).optional(),
  regionArea: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  country: z.string().trim().max(100).default("India").optional(),
  state: z.string().trim().max(100).default("Maharashtra").optional(),
  zone: z.string().trim().max(100).nullable().optional(),
  area: z.string().trim().max(100).nullable().optional(),
  pincode: z.string().trim().max(20).nullable().optional(),
  microTerritory: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
  color: z.string().trim().max(30).default("#2563EB").optional(),
  status: territoryStatus.default("ACTIVE").optional(),
  managerMembershipId: crmId.nullable().optional(),
  areaKm2: z.coerce.number().min(0).max(999999.99).nullable().optional(),
  perimeterKm: z.coerce.number().min(0).max(999999.99).nullable().optional(),
  estBusinesses: z.coerce.number().int().min(0).nullable().optional(),
  estPopulation: z.string().trim().max(100).nullable().optional(),
  pathPoints: boundaryPathSchema.optional(),
});

export const createTerritory = territoryFields
  .extend({
    monthlyTarget: z.coerce.number().min(0).max(999999999999.99).default(0).optional(),
    initialExecutiveIds: z.array(crmId).optional(),
  })
  .strict();

export const updateTerritory = territoryFields
  .partial()
  .merge(revisionCommand)
  .strict()
  .refine(
    (v) => Object.keys(v).length > 1,
    "Provide at least one changed field to update territory",
  );

export const territoryQuery = masterPage
  .extend({
    status: territoryStatus.optional(),
    city: z.string().trim().optional(),
    managerMembershipId: crmId.optional(),
    sortBy: z.enum(["name", "createdAt", "updatedAt", "code"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .refine(
    (v) => (v.page - 1) * v.limit <= 100000,
    "Pagination offset exceeds 100000",
  );

export const assignTerritoryMember = z
  .object({
    membershipId: crmId,
    role: z.enum(["FIELD_EXECUTIVE", "TEAM_LEADER", "MANAGER"]).default("FIELD_EXECUTIVE").optional(),
  })
  .strict();

export const assignTerritoryBusiness = z
  .object({
    accountId: crmId,
  })
  .strict();

export const territoryTargetSchema = z
  .object({
    period: z.string().trim().min(1).max(20),
    monthlyTarget: z.coerce.number().min(0).max(999999999999.99).default(0),
    monthlyAchieved: z.coerce.number().min(0).max(999999999999.99).default(0).optional(),
    visitTarget: z.coerce.number().int().min(0).default(0).optional(),
    visitAchieved: z.coerce.number().int().min(0).default(0).optional(),
    newBusinessTarget: z.coerce.number().int().min(0).default(0).optional(),
    newBusinessAchieved: z.coerce.number().int().min(0).default(0).optional(),
    activeBusinessTarget: z.coerce.number().int().min(0).default(0).optional(),
    retentionTarget: z.coerce.number().int().min(0).max(100).default(0).optional(),
    collectionTarget: z.coerce.number().min(0).max(999999999999.99).default(0).optional(),
    collectionAchieved: z.coerce.number().min(0).max(999999999999.99).default(0).optional(),
  })
  .strict();

export type CreateTerritoryInput = z.infer<typeof createTerritory>;
export type UpdateTerritoryInput = z.infer<typeof updateTerritory>;
export type TerritoryQueryInput = z.infer<typeof territoryQuery>;
export type AssignTerritoryMemberInput = z.infer<typeof assignTerritoryMember>;
export type AssignTerritoryBusinessInput = z.infer<typeof assignTerritoryBusiness>;
export type TerritoryTargetInput = z.infer<typeof territoryTargetSchema>;
