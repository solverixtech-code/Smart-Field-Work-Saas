import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmPolicy } from "./crm-policy";
import {
  territoryBoundaryPointSelect,
  territoryMemberSelect,
  territorySelect,
  territoryTargetSelect,
  TerritoryRow,
} from "./territory-select";
import { TerritoryRepository, territoryConflict } from "./territory.repository";
import * as dto from "./territory-contract";
import { ownerQuery } from "./crm-contract";
import { ownerOption, ownerSelect } from "./crm-select";

@Injectable()
export class TerritoryService {
  constructor(private readonly repo: TerritoryRepository) {}

  private requirePermission(policy: CrmPolicy, action: string) {
    policy.require(`crm.territories.${action}`);
  }

  async memberOptions(principal: RequestPrincipal, query: unknown) {
    const q = ownerQuery.parse(query);
    return this.repo.run(principal, false, async (tx, p) => {
      this.requirePermission(p, "view");
      const where: Prisma.TenantMembershipWhereInput = {
        tenantId: p.scope.tenantId,
        status: "ACTIVE",
        user: {
          status: "ACTIVE",
          ...(q.search ? { fullName: { contains: q.search, mode: "insensitive" } } : {}),
        },
      };
      const [total, rows] = await Promise.all([
        tx.tenantMembership.count({ where }),
        tx.tenantMembership.findMany({
          where,
          select: ownerSelect,
          skip: (q.page - 1) * q.limit,
          take: q.limit,
          orderBy: [{ user: { fullName: "asc" } }, { id: "asc" }],
        }),
      ]);
      return {
        items: rows.map(ownerOption),
        total,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(total / q.limit),
      };
    });
  }

  async list(principal: RequestPrincipal, query: unknown) {
    const q = dto.territoryQuery.parse(query);
    return this.repo.run(principal, false, async (tx, p) => {
      this.requirePermission(p, "view");

      const where: Prisma.TerritoryWhereInput = {
        tenantId: p.scope.tenantId,
        deletedAt: null,
        ...(q.status ? { status: q.status } : {}),
        ...(q.city ? { city: { contains: q.city, mode: "insensitive" } } : {}),
        ...(q.managerMembershipId ? { managerMembershipId: q.managerMembershipId } : {}),
        ...(q.search
          ? {
              OR: [
                { name: { contains: q.search, mode: "insensitive" } },
                { code: { contains: q.search, mode: "insensitive" } },
                { city: { contains: q.search, mode: "insensitive" } },
                { regionArea: { contains: q.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const [items, total] = await Promise.all([
        tx.territory.findMany({
          where,
          select: territorySelect,
          skip: (q.page - 1) * q.limit,
          take: q.limit,
          orderBy: { [q.sortBy]: q.sortDirection },
        }),
        tx.territory.count({ where }),
      ]);

      // Calculate summary stats across all tenant territories
      const allTerritories = await tx.territory.findMany({
        where: { tenantId: p.scope.tenantId, deletedAt: null },
        select: {
          id: true,
          status: true,
          _count: { select: { members: true } },
          targets: {
            orderBy: { period: "desc" },
            take: 1,
            select: { monthlyTarget: true, monthlyAchieved: true },
          },
        },
      });

      let totalTarget = 0;
      let totalAchieved = 0;
      let totalExecutives = 0;
      let activeCount = 0;

      for (const t of allTerritories) {
        if (t.status === "ACTIVE") activeCount++;
        totalExecutives += t._count.members;
        const target = t.targets[0];
        if (target) {
          totalTarget += Number(target.monthlyTarget || 0);
          totalAchieved += Number(target.monthlyAchieved || 0);
        }
      }

      const avgPerformance = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

      return {
        items,
        total,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(total / q.limit),
        summary: {
          totalTerritories: allTerritories.length,
          activeTerritories: activeCount,
          totalExecutives,
          totalTarget,
          totalRevenueAchieved: totalAchieved,
          avgPerformancePercentage: avgPerformance,
        },
      };
    });
  }

  async get(principal: RequestPrincipal, id: string) {
    return this.repo.run(principal, false, async (tx, p) => {
      this.requirePermission(p, "view");
      const row = await this.repo.territory(tx, p, id);

      const [boundaryPoints, targets, members] = await Promise.all([
        tx.territoryBoundaryPoint.findMany({
          where: { territoryId: id },
          select: territoryBoundaryPointSelect,
          orderBy: { sequence: "asc" },
        }),
        tx.territoryTarget.findMany({
          where: { territoryId: id },
          select: territoryTargetSelect,
          orderBy: { period: "desc" },
        }),
        tx.territoryMember.findMany({
          where: { territoryId: id },
          select: territoryMemberSelect,
          orderBy: { assignedAt: "desc" },
        }),
      ]);

      const pathPoints: [number, number][] = boundaryPoints.map((pt) => [
        pt.latitude,
        pt.longitude,
      ]);

      return {
        ...row,
        pathPoints,
        targets,
        members,
      };
    });
  }

  async create(principal: RequestPrincipal, body: unknown) {
    const v = dto.createTerritory.parse(body);
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "create");

      if (v.managerMembershipId) {
        await this.repo.ensureMembership(tx, p, v.managerMembershipId);
      }

      const code = v.code?.trim() || (await this.repo.generateCode(tx, p.scope.tenantId));

      // Check unique code in tenant
      const existing = await tx.territory.findFirst({
        where: { tenantId: p.scope.tenantId, code, deletedAt: null },
      });
      if (existing) {
        territoryConflict("CRM_TERRITORY_CODE_EXISTS");
      }

      const territory = await tx.territory.create({
        data: {
          tenantId: p.scope.tenantId,
          code,
          name: v.name,
          regionArea: v.regionArea,
          city: v.city,
          country: v.country || "India",
          state: v.state || "Maharashtra",
          zone: v.zone,
          area: v.area,
          pincode: v.pincode,
          microTerritory: v.microTerritory,
          description: v.description,
          notes: v.notes,
          color: v.color || "#2563EB",
          status: v.status || "ACTIVE",
          managerMembershipId: v.managerMembershipId || null,
          areaKm2: v.areaKm2 != null ? new Prisma.Decimal(v.areaKm2) : null,
          perimeterKm: v.perimeterKm != null ? new Prisma.Decimal(v.perimeterKm) : null,
          estBusinesses: v.estBusinesses ?? 0,
          estPopulation: v.estPopulation,
          createdByMembershipId: p.scope.membershipId,
          updatedByMembershipId: p.scope.membershipId,
        },
        select: territorySelect,
      });

      // Insert polygon boundary vertices if provided
      if (v.pathPoints && v.pathPoints.length > 0) {
        await tx.territoryBoundaryPoint.createMany({
          data: v.pathPoints.map((pt, idx) => ({
            tenantId: p.scope.tenantId,
            territoryId: territory.id,
            sequence: idx,
            latitude: pt[0],
            longitude: pt[1],
          })),
        });
      }

      // Assign initial executives if provided
      if (v.initialExecutiveIds && v.initialExecutiveIds.length > 0) {
        for (const execId of v.initialExecutiveIds) {
          await this.repo.ensureMembership(tx, p, execId);
          await tx.territoryMember.create({
            data: {
              tenantId: p.scope.tenantId,
              territoryId: territory.id,
              membershipId: execId,
              role: "FIELD_EXECUTIVE",
              assignedByMembershipId: p.scope.membershipId,
            },
          });
        }
      }

      // Create initial monthly target if specified
      if (v.monthlyTarget && v.monthlyTarget > 0) {
        const currentPeriod = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        await tx.territoryTarget.create({
          data: {
            tenantId: p.scope.tenantId,
            territoryId: territory.id,
            period: currentPeriod,
            monthlyTarget: new Prisma.Decimal(v.monthlyTarget),
            monthlyAchieved: new Prisma.Decimal(0),
          },
        });
      }

      await this.repo.audit(tx, p, "territory.created", territory.id, {
        code: territory.code,
        name: territory.name,
      });

      return territory;
    });
  }

  async update(principal: RequestPrincipal, id: string, body: unknown) {
    const v = dto.updateTerritory.parse(body);
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "update");
      const current = await this.repo.territory(tx, p, id, true);

      if (current.revision !== v.expectedRevision) {
        territoryConflict("CRM_STALE_REVISION");
      }

      if (v.managerMembershipId) {
        await this.repo.ensureMembership(tx, p, v.managerMembershipId);
      }

      const updated = await tx.territory.update({
        where: { id },
        data: {
          ...(v.name != null ? { name: v.name } : {}),
          ...(v.code != null ? { code: v.code } : {}),
          ...(v.regionArea !== undefined ? { regionArea: v.regionArea } : {}),
          ...(v.city !== undefined ? { city: v.city } : {}),
          ...(v.country !== undefined ? { country: v.country } : {}),
          ...(v.state !== undefined ? { state: v.state } : {}),
          ...(v.zone !== undefined ? { zone: v.zone } : {}),
          ...(v.area !== undefined ? { area: v.area } : {}),
          ...(v.pincode !== undefined ? { pincode: v.pincode } : {}),
          ...(v.microTerritory !== undefined ? { microTerritory: v.microTerritory } : {}),
          ...(v.description !== undefined ? { description: v.description } : {}),
          ...(v.notes !== undefined ? { notes: v.notes } : {}),
          ...(v.color != null ? { color: v.color } : {}),
          ...(v.status != null ? { status: v.status } : {}),
          ...(v.managerMembershipId !== undefined ? { managerMembershipId: v.managerMembershipId } : {}),
          ...(v.areaKm2 !== undefined ? { areaKm2: v.areaKm2 != null ? new Prisma.Decimal(v.areaKm2) : null } : {}),
          ...(v.perimeterKm !== undefined ? { perimeterKm: v.perimeterKm != null ? new Prisma.Decimal(v.perimeterKm) : null } : {}),
          ...(v.estBusinesses !== undefined ? { estBusinesses: v.estBusinesses } : {}),
          ...(v.estPopulation !== undefined ? { estPopulation: v.estPopulation } : {}),
          revision: { increment: 1 },
          updatedByMembershipId: p.scope.membershipId,
        },
        select: territorySelect,
      });

      // Replace boundary vertices if provided
      if (v.pathPoints !== undefined) {
        await tx.territoryBoundaryPoint.deleteMany({
          where: { territoryId: id },
        });
        if (v.pathPoints && v.pathPoints.length > 0) {
          await tx.territoryBoundaryPoint.createMany({
            data: v.pathPoints.map((pt, idx) => ({
              tenantId: p.scope.tenantId,
              territoryId: id,
              sequence: idx,
              latitude: pt[0],
              longitude: pt[1],
            })),
          });
        }
      }

      await this.repo.audit(tx, p, "territory.updated", id, {
        revisionBefore: current.revision,
        revisionAfter: updated.revision,
      });

      return updated;
    });
  }

  async remove(principal: RequestPrincipal, id: string, expectedRevision?: number) {
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "delete");
      const current = await this.repo.territory(tx, p, id, true);

      if (expectedRevision != null && current.revision !== expectedRevision) {
        territoryConflict("CRM_STALE_REVISION");
      }

      await tx.territory.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          revision: { increment: 1 },
          updatedByMembershipId: p.scope.membershipId,
        },
      });

      await this.repo.audit(tx, p, "territory.deleted", id);
    });
  }

  // ─── Members ─────────────────────────────────────────────────────────────
  async listMembers(principal: RequestPrincipal, territoryId: string) {
    return this.repo.run(principal, false, async (tx, p) => {
      this.requirePermission(p, "view");
      await this.repo.territory(tx, p, territoryId);

      return await tx.territoryMember.findMany({
        where: { territoryId },
        select: territoryMemberSelect,
        orderBy: { assignedAt: "desc" },
      });
    });
  }

  async assignMember(principal: RequestPrincipal, territoryId: string, body: unknown) {
    const v = dto.assignTerritoryMember.parse(body);
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "assign");
      await this.repo.territory(tx, p, territoryId);
      await this.repo.ensureMembership(tx, p, v.membershipId);

      const member = await tx.territoryMember.upsert({
        where: {
          territoryId_membershipId: {
            territoryId,
            membershipId: v.membershipId,
          },
        },
        create: {
          tenantId: p.scope.tenantId,
          territoryId,
          membershipId: v.membershipId,
          role: v.role || "FIELD_EXECUTIVE",
          assignedByMembershipId: p.scope.membershipId,
        },
        update: {
          role: v.role || "FIELD_EXECUTIVE",
          assignedByMembershipId: p.scope.membershipId,
        },
        select: territoryMemberSelect,
      });

      await this.repo.audit(tx, p, "territory.member.assigned", territoryId, {
        membershipId: v.membershipId,
        role: member.role,
      });

      return member;
    });
  }

  async unassignMember(principal: RequestPrincipal, territoryId: string, membershipId: string) {
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "assign");
      await this.repo.territory(tx, p, territoryId);

      await tx.territoryMember.deleteMany({
        where: {
          territoryId,
          membershipId,
          tenantId: p.scope.tenantId,
        },
      });

      await this.repo.audit(tx, p, "territory.member.unassigned", territoryId, {
        membershipId,
      });
    });
  }

  // ─── Businesses (Accounts) ────────────────────────────────────────────────
  async listBusinesses(principal: RequestPrincipal, territoryId: string) {
    return this.repo.run(principal, false, async (tx, p) => {
      this.requirePermission(p, "view");
      await this.repo.territory(tx, p, territoryId);

      return await tx.account.findMany({
        where: {
          tenantId: p.scope.tenantId,
          territoryId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          categoryLabel: true,
          status: true,
          addressLine1: true,
          city: true,
          postalCode: true,
          ownerMembership: {
            select: {
              id: true,
              user: { select: { fullName: true, avatarUrl: true } },
            },
          },
          contacts: {
            where: { isPrimary: true, deletedAt: null },
            select: { name: true, phone: true, email: true },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      });
    });
  }

  async assignBusiness(principal: RequestPrincipal, territoryId: string, body: unknown) {
    const v = dto.assignTerritoryBusiness.parse(body);
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "update");
      await this.repo.territory(tx, p, territoryId);
      await this.repo.ensureAccount(tx, p, v.accountId);

      const updated = await tx.account.update({
        where: { id: v.accountId },
        data: {
          territoryId,
          revision: { increment: 1 },
          updatedByMembershipId: p.scope.membershipId,
        },
        select: {
          id: true,
          name: true,
          territoryId: true,
        },
      });

      await this.repo.audit(tx, p, "territory.business.assigned", territoryId, {
        accountId: v.accountId,
      });

      return updated;
    });
  }

  async unassignBusiness(principal: RequestPrincipal, territoryId: string, accountId: string) {
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "update");
      await this.repo.territory(tx, p, territoryId);
      await this.repo.ensureAccount(tx, p, accountId);

      await tx.account.update({
        where: { id: accountId },
        data: {
          territoryId: null,
          revision: { increment: 1 },
          updatedByMembershipId: p.scope.membershipId,
        },
      });

      await this.repo.audit(tx, p, "territory.business.unassigned", territoryId, {
        accountId,
      });
    });
  }

  // ─── Targets ──────────────────────────────────────────────────────────────
  async getTargets(principal: RequestPrincipal, territoryId: string) {
    return this.repo.run(principal, false, async (tx, p) => {
      this.requirePermission(p, "view");
      await this.repo.territory(tx, p, territoryId);

      return await tx.territoryTarget.findMany({
        where: { territoryId },
        select: territoryTargetSelect,
        orderBy: { period: "desc" },
      });
    });
  }

  async updateTargets(principal: RequestPrincipal, territoryId: string, body: unknown) {
    const v = dto.territoryTargetSchema.parse(body);
    return this.repo.run(principal, true, async (tx, p) => {
      this.requirePermission(p, "update");
      await this.repo.territory(tx, p, territoryId);

      const target = await tx.territoryTarget.upsert({
        where: {
          territoryId_period: {
            territoryId,
            period: v.period,
          },
        },
        create: {
          tenantId: p.scope.tenantId,
          territoryId,
          period: v.period,
          monthlyTarget: new Prisma.Decimal(v.monthlyTarget),
          monthlyAchieved: new Prisma.Decimal(v.monthlyAchieved || 0),
          visitTarget: v.visitTarget || 0,
          visitAchieved: v.visitAchieved || 0,
          newBusinessTarget: v.newBusinessTarget || 0,
          newBusinessAchieved: v.newBusinessAchieved || 0,
          activeBusinessTarget: v.activeBusinessTarget || 0,
          retentionTarget: v.retentionTarget || 0,
          collectionTarget: new Prisma.Decimal(v.collectionTarget || 0),
          collectionAchieved: new Prisma.Decimal(v.collectionAchieved || 0),
        },
        update: {
          monthlyTarget: new Prisma.Decimal(v.monthlyTarget),
          ...(v.monthlyAchieved !== undefined ? { monthlyAchieved: new Prisma.Decimal(v.monthlyAchieved) } : {}),
          ...(v.visitTarget !== undefined ? { visitTarget: v.visitTarget } : {}),
          ...(v.visitAchieved !== undefined ? { visitAchieved: v.visitAchieved } : {}),
          ...(v.newBusinessTarget !== undefined ? { newBusinessTarget: v.newBusinessTarget } : {}),
          ...(v.newBusinessAchieved !== undefined ? { newBusinessAchieved: v.newBusinessAchieved } : {}),
          ...(v.activeBusinessTarget !== undefined ? { activeBusinessTarget: v.activeBusinessTarget } : {}),
          ...(v.retentionTarget !== undefined ? { retentionTarget: v.retentionTarget } : {}),
          ...(v.collectionTarget !== undefined ? { collectionTarget: new Prisma.Decimal(v.collectionTarget) } : {}),
          ...(v.collectionAchieved !== undefined ? { collectionAchieved: new Prisma.Decimal(v.collectionAchieved) } : {}),
          revision: { increment: 1 },
        },
        select: territoryTargetSelect,
      });

      await this.repo.audit(tx, p, "territory.target.updated", territoryId, {
        period: v.period,
      });

      return target;
    });
  }

  // ─── Performance Read Model ───────────────────────────────────────────────
  async getPerformance(principal: RequestPrincipal, territoryId: string) {
    return this.repo.run(principal, false, async (tx, p) => {
      this.requirePermission(p, "view");
      const territory = await this.repo.territory(tx, p, territoryId);

      const [targets, members, accountCount, leadCount] = await Promise.all([
        tx.territoryTarget.findMany({
          where: { territoryId },
          select: territoryTargetSelect,
          orderBy: { period: "desc" },
          take: 6,
        }),
        tx.territoryMember.findMany({
          where: { territoryId },
          select: territoryMemberSelect,
        }),
        tx.account.count({
          where: { tenantId: p.scope.tenantId, territoryId, deletedAt: null },
        }),
        tx.lead.count({
          where: { tenantId: p.scope.tenantId, territoryId, deletedAt: null },
        }),
      ]);

      const latestTarget = targets[0] || null;
      const monthlyTarget = latestTarget ? Number(latestTarget.monthlyTarget) : 0;
      const monthlyAchieved = latestTarget ? Number(latestTarget.monthlyAchieved) : 0;
      const performancePercentage =
        monthlyTarget > 0 ? Math.min(100, Math.round((monthlyAchieved / monthlyTarget) * 100)) : 0;

      return {
        territoryId,
        code: territory.code,
        name: territory.name,
        monthlyTarget,
        monthlyAchieved,
        performancePercentage,
        activeBusinessesCount: accountCount,
        leadsCount: leadCount,
        executivesCount: members.length,
        periodTargets: targets,
      };
    });
  }
}
