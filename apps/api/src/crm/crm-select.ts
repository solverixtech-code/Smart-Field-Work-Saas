import { Prisma } from "@prisma/client";
export const ownerSelect = {
  id: true,
  designation: true,
  tenantRole: { select: { name: true, code: true } },
  user: { select: { fullName: true, avatarUrl: true, role: true } },
} satisfies Prisma.TenantMembershipSelect;
export type OwnerRow = Prisma.TenantMembershipGetPayload<{ select: typeof ownerSelect }>;
export const ownerOption = (row: OwnerRow) => ({
  id: row.id,
  displayName: row.user.fullName,
  avatarUrl: row.user.avatarUrl || null,
  role:
    row.designation ||
    row.tenantRole?.name ||
    (row.user.role === "SUPER_ADMIN"
      ? "Senior Sales Manager"
      : row.user.role === "ADMIN"
        ? "Area Operations Lead"
        : row.user.role === "SALES_MANAGER"
          ? "Sales Manager"
          : row.user.role === "TEAM_LEADER"
            ? "Team Leader"
            : row.user.role === "FIELD_EXECUTIVE"
              ? "Field Executive"
              : row.user.role === "SUPPORT"
                ? "Regional Support Lead"
                : row.user.role === "FINANCE_OPS"
                  ? "Finance Operations Lead"
                  : "Manager"),
});
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
