import { z } from "zod";
import { masterPage } from "../platform/masters/master-contract";

export const crmId = z.string().uuid();
export const crmStatus = z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]);
const label = z.string().trim().min(1).max(200);
const text = (max: number) => z.string().trim().max(max).nullable().optional();
const optionalId = crmId.nullable().optional();
const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{6,14}$/))
  .nullable()
  .optional();
export const contactFields = z
  .object({
    name: label,
    phone,
    email: z.string().trim().email().max(254).nullable().optional(),
    roleValueId: optionalId,
    status: crmStatus.optional(),
  })
  .strict();
const hasContact = (v: { phone?: string | null; email?: string | null }) =>
  Boolean(v.phone || v.email);
export const createLinkedContact = contactFields.refine(hasContact, {
  message: "A phone or email is required",
  path: ["phone"],
});
export const createContact = contactFields
  .extend({ accountId: optionalId, ownerMembershipId: optionalId })
  .strict()
  .refine(hasContact, {
    message: "A phone or email is required",
    path: ["phone"],
  })
  .refine((v) => !v.accountId || v.ownerMembershipId == null, {
    message: "Linked contacts inherit business ownership",
    path: ["ownerMembershipId"],
  });
export const accountFields = z
  .object({
    name: label,
    businessTypeValueId: optionalId,
    sourceValueId: optionalId,
    categoryLabel: label.nullable().optional(),
    status: crmStatus.optional(),
    ownerMembershipId: crmId.optional(),
    addressLine1: text(200),
    addressLine2: text(200),
    city: text(100),
    state: text(100),
    postalCode: text(20),
    countryCode: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .nullable()
      .optional(),
    website: z
      .string()
      .url()
      .max(2048)
      .refine((v) => /^https?:\/\//i.test(v), "Use an HTTP(S) URL")
      .nullable()
      .optional(),
    gstin: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{15}$/)
      .nullable()
      .optional(),
    establishedYear: z
      .number()
      .int()
      .min(1800)
      .refine(
        (v) => v <= new Date().getUTCFullYear(),
        "Year cannot be in the future",
      )
      .nullable()
      .optional(),
    description: text(2000),
  })
  .strict();
export const createAccount = accountFields
  .extend({ primaryContact: createLinkedContact.optional() })
  .strict()
  .refine(
    (v) =>
      !v.primaryContact ||
      !v.primaryContact.status ||
      v.primaryContact.status === "ACTIVE",
    {
      message: "Primary contact must be active",
      path: ["primaryContact", "status"],
    },
  );
export const revisionCommand = z
  .object({ expectedRevision: z.number().int().positive().max(2147483647) })
  .strict();
export const updateAccount = accountFields
  .partial()
  .merge(revisionCommand)
  .strict()
  .refine(
    (v) => Object.keys(v).length > 1,
    "Provide at least one changed field",
  );
export const updateContact = contactFields
  .partial()
  .extend({ ownerMembershipId: crmId.optional() })
  .merge(revisionCommand)
  .strict()
  .refine(
    (v) => Object.keys(v).length > 1,
    "Provide at least one changed field",
  );
export const primaryCommand = revisionCommand
  .extend({ contactId: crmId.nullable() })
  .strict();
const pageFields = masterPage.extend({
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});
const boundedOffset = (v: { page: number; limit: number }) =>
  (v.page - 1) * v.limit <= 100000;
export const accountQuery = pageFields
  .extend({
    status: crmStatus.optional(),
    businessTypeValueId: crmId.optional(),
    sourceValueId: crmId.optional(),
    city: z.string().trim().max(100).optional(),
    ownerMembershipId: crmId.optional(),
  })
  .strict()
  .refine(boundedOffset, "Pagination offset exceeds 100000");
export const contactQueryFields = pageFields
  .extend({
    status: crmStatus.optional(),
    roleValueId: crmId.optional(),
    ownerMembershipId: crmId.optional(),
    accountId: crmId.optional(),
  })
  .strict();
export const contactQuery = contactQueryFields.refine(
  boundedOffset,
  "Pagination offset exceeds 100000",
);
export const nestedContactQuery = contactQueryFields
  .omit({ accountId: true })
  .strict()
  .refine(boundedOffset, "Pagination offset exceeds 100000");
export const ownerQuery = masterPage.refine(
  boundedOffset,
  "Pagination offset exceeds 100000",
);
export type CrmResource = "businesses" | "contacts";
