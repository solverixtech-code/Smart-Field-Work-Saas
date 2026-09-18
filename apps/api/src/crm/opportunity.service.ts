import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmPolicy } from "./crm-policy";
import { CrmRepository, crmConflict } from "./crm.repository";
import * as dto from "./opportunity-contract";
import { requireOpportunity, opportunityScope } from "./opportunity-policy";
import { opportunitySelect, OpportunityRow } from "./opportunity-select";

const page = <T>(
  items: T[],
  total: number,
  q: { page: number; limit: number },
) => ({
  items,
  total,
  page: q.page,
  limit: q.limit,
  totalPages: Math.ceil(total / q.limit),
});

function dealRevision(row: OpportunityRow, expectedRevision: number) {
  if (row.revision !== expectedRevision) {
    crmConflict("CRM_STALE_REVISION");
  }
}

@Injectable()
export class OpportunityService {
  constructor(private readonly repo: CrmRepository) {}

  private policy(actor: RequestPrincipal) {
    return new CrmPolicy(actor);
  }

  async list(actor: RequestPrincipal, query: unknown) {
    const p = this.policy(actor);
    requireOpportunity(p, "read");
    const v = dto.opportunityQuery.parse(query);
    const scope = opportunityScope(p);

    const searchWhere: Prisma.OpportunityWhereInput[] = v.search
      ? [
          { title: { contains: v.search, mode: "insensitive" } },
          { dealCode: { contains: v.search, mode: "insensitive" } },
          { account: { name: { contains: v.search, mode: "insensitive" } } },
          { lead: { name: { contains: v.search, mode: "insensitive" } } },
          {
            lead: { businessName: { contains: v.search, mode: "insensitive" } },
          },
        ]
      : [];

    const where: Prisma.OpportunityWhereInput = {
      ...scope,
      ...(v.stage ? { stage: v.stage } : {}),
      ...(v.stageValueId ? { stageValueId: v.stageValueId } : {}),
      ...(v.priority ? { priority: v.priority } : {}),
      ...(v.assignedMembershipId
        ? { assignedMembershipId: v.assignedMembershipId }
        : {}),
      ...(v.ownerMembershipId
        ? { ownerMembershipId: v.ownerMembershipId }
        : {}),
      ...(v.leadId ? { leadId: v.leadId } : {}),
      ...(v.accountId ? { accountId: v.accountId } : {}),
      ...(v.contactId ? { contactId: v.contactId } : {}),
      ...(searchWhere.length ? { OR: searchWhere } : {}),
    };

    return this.repo.run(actor, false, async (tx) => {
      const [items, total] = await Promise.all([
        tx.opportunity.findMany({
          where,
          select: opportunitySelect,
          orderBy: { [v.sortBy]: v.sortDirection },
          skip: (v.page - 1) * v.limit,
          take: v.limit,
        }),
        tx.opportunity.count({ where }),
      ]);

      return page(items, total, v);
    });
  }

  async summary(actor: RequestPrincipal) {
    const p = this.policy(actor);
    requireOpportunity(p, "read");
    const scope = opportunityScope(p);

    return this.repo.run(actor, false, async (tx) => {
      const deals = await tx.opportunity.findMany({
        where: scope,
        select: {
          id: true,
          stage: true,
          stageValueId: true,
          amount: true,
          stageValue: {
            select: {
              id: true,
              code: true,
              name: true,
              displayColor: true,
              sortOrder: true,
            },
          },
        },
      });

      const masterStages = await tx.masterValue.findMany({
        where: {
          tenantId: p.scope.tenantId,
          definition: { code: "deal_stage" },
          isActive: true,
        },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          code: true,
          name: true,
          displayColor: true,
          sortOrder: true,
        },
      });

      const defaultStageKeys = [
        { code: "new", name: "New Deals", displayColor: "#3B82F6" },
        { code: "contacted", name: "Contacted", displayColor: "#8B5CF6" },
        { code: "demo", name: "Demo Scheduled", displayColor: "#EAB308" },
        { code: "negotiation", name: "Negotiation", displayColor: "#F97316" },
        { code: "won", name: "Won", displayColor: "#22C55E" },
        { code: "lost", name: "Lost", displayColor: "#EF4444" },
      ];

      const stageSummaries = (
        masterStages.length ? masterStages : defaultStageKeys
      ).map((mStage) => {
        const stageDeals = deals.filter(
          (d) =>
            ("id" in mStage && d.stageValueId === mStage.id) ||
            d.stage?.toLowerCase() === mStage.code.toLowerCase(),
        );
        const count = stageDeals.length;
        const value = stageDeals.reduce(
          (acc, curr) => acc + Number(curr.amount || 0),
          0,
        );
        return {
          id: "id" in mStage ? mStage.id : undefined,
          code: mStage.code,
          label: mStage.name,
          color: mStage.displayColor,
          count,
          value,
        };
      });

      const totalDeals = deals.length;
      const totalPipelineValue = deals.reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0,
      );

      return {
        totalDeals,
        totalPipelineValue,
        stages: stageSummaries,
      };
    });
  }

  async findOne(actor: RequestPrincipal, id: string) {
    const p = this.policy(actor);
    requireOpportunity(p, "read");
    const scope = opportunityScope(p);

    return this.repo.run(actor, false, async (tx) => {
      const deal = await tx.opportunity.findFirst({
        where: { id, ...scope },
        select: opportunitySelect,
      });

      if (!deal) {
        throw new NotFoundException(`Opportunity with ID ${id} not found`);
      }
      return deal;
    });
  }

  async create(actor: RequestPrincipal, body: unknown) {
    const p = this.policy(actor);
    requireOpportunity(p, "create");
    const v = dto.createOpportunity.parse(body);

    return this.repo.run(actor, true, async (tx) => {
      let stageValueId = v.stageValueId;
      if (!stageValueId && v.stage) {
        const master = await tx.masterValue.findFirst({
          where: {
            tenantId: p.scope.tenantId,
            definition: { code: "deal_stage" },
            code: v.stage.toLowerCase(),
          },
          select: { id: true },
        });
        if (master) stageValueId = master.id;
      }

      const count = await tx.opportunity.count({
        where: { tenantId: p.scope.tenantId },
      });
      const dealCode = `DEAL-${(count + 1001).toString()}`;

      const deal = await tx.opportunity.create({
        data: {
          tenantId: p.scope.tenantId,
          dealCode,
          title: v.title,
          amount: v.amount ?? 0,
          stage: v.stage ?? "new",
          stageValueId,
          priority: v.priority ?? "MEDIUM",
          sourceValueId: v.sourceValueId,
          leadId: v.leadId,
          accountId: v.accountId,
          contactId: v.contactId,
          assignedMembershipId: v.assignedMembershipId,
          ownerMembershipId: v.ownerMembershipId || p.scope.membershipId,
          expectedClosingDate: v.expectedClosingDate,
          description: v.description,
        },
        select: opportunitySelect,
      });

      await this.repo.audit(
        tx,
        p,
        "opportunity.created",
        "Opportunity",
        deal.id,
        {
          dealCode: deal.dealCode,
          title: deal.title,
          amount: Number(deal.amount),
          stage: deal.stage,
        },
      );

      return deal;
    });
  }

  async update(actor: RequestPrincipal, id: string, body: unknown) {
    const p = this.policy(actor);
    requireOpportunity(p, "update");
    const v = dto.updateOpportunity.parse(body);
    const scope = opportunityScope(p);

    return this.repo.run(actor, true, async (tx) => {
      const row = await tx.opportunity.findFirst({
        where: { id, ...scope },
        select: opportunitySelect,
      });
      if (!row)
        throw new NotFoundException(`Opportunity with ID ${id} not found`);

      dealRevision(row, v.expectedRevision);

      let stageValueId = v.stageValueId;
      if (v.stage && !stageValueId) {
        const master = await tx.masterValue.findFirst({
          where: {
            tenantId: p.scope.tenantId,
            definition: { code: "deal_stage" },
            code: v.stage.toLowerCase(),
          },
          select: { id: true },
        });
        if (master) stageValueId = master.id;
      }

      const updated = await tx.opportunity.update({
        where: { id },
        data: {
          title: v.title ?? row.title,
          amount: v.amount ?? row.amount,
          stage: v.stage ?? row.stage,
          stageValueId: stageValueId ?? row.stageValueId,
          priority: v.priority ?? row.priority,
          sourceValueId:
            v.sourceValueId !== undefined ? v.sourceValueId : row.sourceValueId,
          leadId: v.leadId !== undefined ? v.leadId : row.leadId,
          accountId: v.accountId !== undefined ? v.accountId : row.accountId,
          contactId: v.contactId !== undefined ? v.contactId : row.contactId,
          assignedMembershipId:
            v.assignedMembershipId !== undefined
              ? v.assignedMembershipId
              : row.assignedMembershipId,
          expectedClosingDate:
            v.expectedClosingDate !== undefined
              ? v.expectedClosingDate
              : row.expectedClosingDate,
          description:
            v.description !== undefined ? v.description : row.description,
          revision: { increment: 1 },
        },
        select: opportunitySelect,
      });

      await this.repo.audit(tx, p, "opportunity.updated", "Opportunity", id, {
        revisionBefore: row.revision,
        revisionAfter: updated.revision,
      });

      return updated;
    });
  }

  async updateStage(actor: RequestPrincipal, id: string, body: unknown) {
    const p = this.policy(actor);
    requireOpportunity(p, "update");
    const v = dto.updateOpportunityStage.parse(body);
    const scope = opportunityScope(p);

    return this.repo.run(actor, true, async (tx) => {
      const row = await tx.opportunity.findFirst({
        where: { id, ...scope },
        select: opportunitySelect,
      });
      if (!row)
        throw new NotFoundException(`Opportunity with ID ${id} not found`);

      dealRevision(row, v.expectedRevision);

      let stageValueId = v.stageValueId;
      if (!stageValueId) {
        const master = await tx.masterValue.findFirst({
          where: {
            tenantId: p.scope.tenantId,
            definition: { code: "deal_stage" },
            code: v.stage.toLowerCase(),
          },
          select: { id: true },
        });
        if (master) stageValueId = master.id;
      }

      const isWonOrLost = ["won", "lost"].includes(v.stage.toLowerCase());
      const closedAt = isWonOrLost ? new Date() : null;

      const updated = await tx.opportunity.update({
        where: { id },
        data: {
          stage: v.stage,
          stageValueId: stageValueId ?? row.stageValueId,
          closedAt: closedAt ?? row.closedAt,
          lostReason:
            v.lostReason !== undefined ? v.lostReason : row.lostReason,
          revision: { increment: 1 },
        },
        select: opportunitySelect,
      });

      await this.repo.audit(
        tx,
        p,
        "opportunity.stage_changed",
        "Opportunity",
        id,
        {
          stageBefore: row.stage,
          stageAfter: updated.stage,
          revisionBefore: row.revision,
          revisionAfter: updated.revision,
        },
      );

      return updated;
    });
  }

  async delete(actor: RequestPrincipal, id: string) {
    const p = this.policy(actor);
    requireOpportunity(p, "delete");
    const scope = opportunityScope(p);

    return this.repo.run(actor, true, async (tx) => {
      const row = await tx.opportunity.findFirst({
        where: { id, ...scope },
        select: { id: true, dealCode: true },
      });
      if (!row)
        throw new NotFoundException(`Opportunity with ID ${id} not found`);

      await tx.opportunity.delete({ where: { id } });

      await this.repo.audit(tx, p, "opportunity.deleted", "Opportunity", id, {
        dealCode: row.dealCode,
      });

      return { success: true, id };
    });
  }
}
