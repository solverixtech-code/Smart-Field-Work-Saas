import { Prisma } from "@prisma/client";
export const ownerSelect = {
  id: true,
  user: { select: { fullName: true } },
} satisfies Prisma.TenantMembershipSelect;
export const accountSelect = {
  id: true,
  tenantId: true,
  name: true,
  businessTypeValueId: true,
  sourceValueId: true,
  categoryLabel: true,
  status: true,
  ownerMembershipId: true,
  ownerMembership: { select: ownerSelect },
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  postalCode: true,
  countryCode: true,
  website: true,
  gstin: true,
  establishedYear: true,
  description: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  createdByMembershipId: true,
  updatedByMembershipId: true,
} satisfies Prisma.AccountSelect;
export const contactSelect = {
  id: true,
  tenantId: true,
  accountId: true,
  name: true,
  phone: true,
  email: true,
  roleValueId: true,
  status: true,
  ownerMembershipId: true,
  ownerMembership: { select: ownerSelect },
  isPrimary: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  createdByMembershipId: true,
  updatedByMembershipId: true,
} satisfies Prisma.ContactSelect;
export type AccountRow = Prisma.AccountGetPayload<{
  select: typeof accountSelect;
}>;
export type ContactRow = Prisma.ContactGetPayload<{
  select: typeof contactSelect;
}>;
