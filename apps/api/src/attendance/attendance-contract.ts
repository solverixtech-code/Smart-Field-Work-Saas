import { z } from "zod";

export const installation = z
  .object({
    installationId: z.string().uuid(),
    label: z.string().trim().min(1).max(120).optional(),
    platform: z.string().trim().min(1).max(120).optional(),
    userAgent: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

export const punchCommand = installation
  .extend({
    clientCommandId: z.string().uuid(),
    capturedAt: z.string().datetime(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracyMeters: z.number().min(0).max(10_000),
    locationName: z.string().trim().max(300).optional(),
    selfieAssetId: z.string().uuid(),
    remarks: z.string().trim().max(1000).optional(),
  })
  .strict();

export const monitoringQuery = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    search: z.string().trim().max(100).optional(),
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
  })
  .strict();

export const attendanceSiteInput = z
  .object({
    code: z.string().trim().min(1).max(50),
    name: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(500),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMeters: z.number().int().min(25).max(10_000),
    isActive: z.boolean().default(true),
  })
  .strict();

export const attendancePolicyInput = z
  .object({
    enforcementEnabled: z.boolean(),
    maximumAccuracyMeters: z.number().int().min(10).max(1000),
    maximumLocationAgeSeconds: z.number().int().min(15).max(600),
    requirePunchInSelfie: z.boolean(),
    requirePunchOutSelfie: z.boolean(),
  })
  .strict();

export const overrideInput = z
  .object({
    mobilityMode: z.enum(["INHERIT", "OFFICE_ONLY", "FIELD_REMOTE"]),
  })
  .strict();

export const holidayInput = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    name: z.string().trim().min(1).max(120),
  })
  .strict();

export const leaveInput = z
  .object({
    membershipId: z.string().uuid(),
    leaveType: z.string().trim().min(1).max(100),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    remarks: z.string().trim().max(1000).optional(),
  })
  .strict();
