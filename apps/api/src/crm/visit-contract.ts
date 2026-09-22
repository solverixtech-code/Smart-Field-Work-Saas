import { z } from "zod";
import { crmId } from "./crm-contract";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i);
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

export const scheduleVisit = z
  .object({
    targetType: z.enum(["ACCOUNT", "LEAD", "QUICK_ADDRESS"]),
    targetId: crmId.optional(),
    targetName: z.string().trim().min(1).max(200),
    contactName: optionalText(200),
    contactPhone: optionalText(50),
    contactEmail: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().email().max(254).optional(),
    ),
    location: z.string().trim().min(1).max(500),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    geofenceRadiusMeters: z.number().int().min(25).max(10_000),
    visitType: z.enum([
      "Sales Visit",
      "Follow-up",
      "Collection",
      "Requirement Discussion",
      "Product Demo",
      "Onboarding",
    ]),
    purpose: z.string().trim().min(1).max(500),
    scheduledDate: date,
    startTime: time,
    endTime: time,
    priority: z.enum(["High", "Medium", "Low"]),
    recurrence: z.enum(["None", "Weekly", "Bi-Weekly", "Monthly"]),
    executiveMembershipId: crmId.optional(),
    routeArea: optionalText(200),
    travelMode: z.enum(["Bike", "Scooter", "Car", "Public Transport"]),
    allowManualCheckIn: z.boolean(),
    instructions: optionalText(2000),
    checklist: z.array(z.string().trim().min(1).max(300)).max(50),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.targetType !== "QUICK_ADDRESS" && !value.targetId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetId"],
        message: "Select a business or lead.",
      });
    }
    if (value.targetType === "QUICK_ADDRESS" && value.targetId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetId"],
        message: "Quick-address visits cannot reference another target.",
      });
    }
    if ((value.latitude == null) !== (value.longitude == null)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["latitude"],
        message: "Latitude and longitude must be supplied together.",
      });
    }
  });

export const visitExecutiveOptionsQuery = z
  .object({ date: date.optional() })
  .strict();

export const visitAvailabilityQuery = z
  .object({
    executiveMembershipId: crmId.optional(),
    scheduledDate: date,
    startTime: time,
    endTime: time,
  })
  .strict();

export type ScheduleVisitInput = z.infer<typeof scheduleVisit>;
