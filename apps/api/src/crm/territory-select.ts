import { Prisma } from "@prisma/client";

export const territoryManagerSelect = {
  id: true,
  user: {
    select: {
      fullName: true,
      avatarUrl: true,
      email: true,
      mobile: true,
    },
  },
  tenantRole: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.TenantMembershipSelect;

export const territorySelect = {
  id: true,
  tenantId: true,
  code: true,
  name: true,
  regionArea: true,
  city: true,
  country: true,
  state: true,
  zone: true,
  area: true,
  pincode: true,
  microTerritory: true,
  description: true,
  notes: true,
  color: true,
  status: true,
  managerMembershipId: true,
  managerMembership: { select: territoryManagerSelect },
  areaKm2: true,
  perimeterKm: true,
  estBusinesses: true,
  estPopulation: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  createdByMembershipId: true,
  createdByMembership: {
    select: {
      user: {
        select: {
          fullName: true,
        },
      },
    },
  },
  _count: {
    select: {
      members: true,
      accounts: { where: { deletedAt: null } },
      leads: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.TerritorySelect;

export const territoryBoundaryPointSelect = {
  id: true,
  sequence: true,
  latitude: true,
  longitude: true,
} satisfies Prisma.TerritoryBoundaryPointSelect;

export const territoryMemberSelect = {
  id: true,
  territoryId: true,
  membershipId: true,
  role: true,
  assignedAt: true,
  membership: {
    select: {
      id: true,
      status: true,
      user: {
        select: {
          fullName: true,
          avatarUrl: true,
          email: true,
          mobile: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      tenantRole: {
        select: {
          name: true,
        },
      },
    },
  },
} satisfies Prisma.TerritoryMemberSelect;

export const territoryTargetSelect = {
  id: true,
  period: true,
  monthlyTarget: true,
  monthlyAchieved: true,
  visitTarget: true,
  visitAchieved: true,
  newBusinessTarget: true,
  newBusinessAchieved: true,
  activeBusinessTarget: true,
  retentionTarget: true,
  collectionTarget: true,
  collectionAchieved: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TerritoryTargetSelect;

export type TerritoryRow = Prisma.TerritoryGetPayload<{
  select: typeof territorySelect;
}>;

export type TerritoryMemberRow = Prisma.TerritoryMemberGetPayload<{
  select: typeof territoryMemberSelect;
}>;

export type TerritoryTargetRow = Prisma.TerritoryTargetGetPayload<{
  select: typeof territoryTargetSelect;
}>;
