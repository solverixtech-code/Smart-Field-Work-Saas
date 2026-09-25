import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { crmId } from "./crm-contract";
import { CrmPolicy } from "./crm-policy";
import { createDemo, demoListQuery, demoReportQuery, updateDemo } from "./demo-contract";
import { generateDemoCode } from "./demo-code";
import { CrmRepository } from "./crm.repository";
import { isFieldExecutive } from "./lead-policy";

const demoSelect = {
  id: true,
  demoCode: true,
  leadId: true,
  conductedByMembershipId: true,
  conductedByName: true,
  conductedByAvatar: true,
  demoTitle: true,
  demoDate: true,
  demoTime: true,
  demoType: true,
  demoMode: true,
  productService: true,
  attendeesCount: true,
  feedbackRating: true,
  keyQuestions: true,
  outcome: true,
  nextAction: true,
  nextActionDate: true,
  durationMinutes: true,
  probabilityPercentage: true,
  status: true,
  startedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  conductedByMembership: {
    select: {
      employeeCode: true,
      designation: true,
      tenantRole: { select: { name: true } },
      team: { select: { name: true } },
      user: { select: { fullName: true, avatarUrl: true, email: true, mobile: true } },
    },
  },
  lead: {
    select: {
      id: true,
      leadCode: true,
      name: true,
      businessName: true,
      contactName: true,
      phone: true,
      email: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      estimatedValue: true,
      priority: true,
      status: true,
      convertedAt: true,
      sourceValue: { select: { name: true } },
      opportunity: { select: { amount: true, stage: true } },
    },
  },
} satisfies Prisma.LeadDemoSelect;

function localDate(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [hourText, minute] = value.split(":");
    const hour = Number(hourText);
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${minute} ${suffix}`;
  }
  return value.toUpperCase().replace(/\s*(AM|PM)$/, " $1");
}

@Injectable()
export class DemoService {
  constructor(private readonly repo: CrmRepository) {}

  private scope(policy: CrmPolicy) {
    return {
      tenantId: policy.scope.tenantId,
      lead: { is: { deletedAt: null } },
      ...(isFieldExecutive(policy)
        ? { conductedByMembershipId: policy.scope.membershipId }
        : {}),
    } satisfies Prisma.LeadDemoWhereInput;
  }

  private async timezone(tx: Prisma.TransactionClient, tenantId: string) {
    return (await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } }))?.timezone ?? "Asia/Kolkata";
  }

  private async executive(tx: Prisma.TransactionClient, tenantId: string, membershipId: string) {
    const membership = await tx.tenantMembership.findFirst({
      where: {
        id: membershipId,
        tenantId,
        status: "ACTIVE",
        user: { status: "ACTIVE" },
        OR: [
          { tenantRole: { code: { in: ["field_executive", "sales_executive", "executive"] } } },
          { user: { role: "FIELD_EXECUTIVE" } },
        ],
      },
      select: {
        id: true,
        designation: true,
        tenantRole: { select: { name: true } },
        team: { select: { name: true } },
        user: { select: { fullName: true, avatarUrl: true } },
      },
    });
    if (!membership) throw new NotFoundException("Field executive not found");
    return membership;
  }

  async list(actor: RequestPrincipal, input: unknown) {
    const query = demoListQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.demos.view");
      const timezone = await this.timezone(tx, policy.scope.tenantId);
      const today = localDate(timezone);
      const scope = this.scope(policy);
      const view: Prisma.LeadDemoWhereInput = query.view === "today"
        ? { demoDate: today }
        : query.view === "scheduled"
          ? { status: { in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "RESCHEDULED"] } }
          : query.view === "completed" ? { status: "COMPLETED" } : {};
      const where: Prisma.LeadDemoWhereInput = {
        ...scope,
        AND: [
          view,
          ...(query.status ? [{ status: query.status }] : []),
          ...(query.demoType ? [{ demoType: query.demoType }] : []),
          ...(query.executiveMembershipId ? [{ conductedByMembershipId: query.executiveMembershipId }] : []),
          ...(query.from || query.to ? [{ demoDate: {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {}),
          } }] : []),
          ...(query.search ? [{ OR: [
            { demoCode: { contains: query.search, mode: "insensitive" as const } },
            { demoTitle: { contains: query.search, mode: "insensitive" as const } },
            { productService: { contains: query.search, mode: "insensitive" as const } },
            { conductedByName: { contains: query.search, mode: "insensitive" as const } },
            { lead: { is: { name: { contains: query.search, mode: "insensitive" as const } } } },
            { lead: { is: { businessName: { contains: query.search, mode: "insensitive" as const } } } },
            { lead: { is: { contactName: { contains: query.search, mode: "insensitive" as const } } } },
          ] }] : []),
        ],
      };
      const [items, total, all, todayCount, scheduled, inProgress, completed, cancelled, converted] = await Promise.all([
        tx.leadDemo.findMany({ where, select: demoSelect, orderBy: [{ demoDate: "desc" }, { demoTime: "desc" }, { id: "desc" }], skip: (query.page - 1) * query.limit, take: query.limit }),
        tx.leadDemo.count({ where }),
        tx.leadDemo.count({ where: scope }),
        tx.leadDemo.count({ where: { ...scope, demoDate: today } }),
        tx.leadDemo.count({ where: { ...scope, status: { in: ["SCHEDULED", "CONFIRMED", "RESCHEDULED"] } } }),
        tx.leadDemo.count({ where: { ...scope, status: "IN_PROGRESS" } }),
        tx.leadDemo.count({ where: { ...scope, status: "COMPLETED" } }),
        tx.leadDemo.count({ where: { ...scope, status: { in: ["CANCELLED", "NO_SHOW"] } } }),
        tx.leadDemo.count({ where: { ...scope, OR: [{ outcome: "CONVERTED" }, { lead: { is: { status: "CONVERTED" } } }] } }),
      ]);
      return { items, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit), today, summary: { all, today: todayCount, scheduled, inProgress, completed, cancelled, converted } };
    });
  }

  async get(actor: RequestPrincipal, id: string) {
    crmId.parse(id);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.demos.view");
      const row = await tx.leadDemo.findFirst({ where: { ...this.scope(policy), id }, select: demoSelect });
      if (!row) throw new NotFoundException("Demo not found");
      const activities = await tx.leadHistory.findMany({
        where: { tenantId: policy.scope.tenantId, leadId: row.leadId, eventType: { startsWith: "demo_" } },
        select: { id: true, eventType: true, message: true, note: true, metadata: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return {
        ...row,
        activities: activities.filter((activity) => {
          const metadata = activity.metadata;
          return metadata && typeof metadata === "object" && !Array.isArray(metadata) && "demoId" in metadata
            ? metadata.demoId === row.id
            : true;
        }),
      };
    });
  }

  async options(actor: RequestPrincipal) {
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.demos.view");
      const executiveOnly = isFieldExecutive(policy);
      const [leads, executives] = await Promise.all([
        tx.lead.findMany({
          where: { tenantId: policy.scope.tenantId, deletedAt: null, ...(executiveOnly ? { assignedMembershipId: policy.scope.membershipId } : {}) },
          select: { id: true, leadCode: true, name: true, businessName: true, contactName: true, phone: true, email: true, addressLine1: true, addressLine2: true, city: true, state: true },
          orderBy: [{ businessName: "asc" }, { name: "asc" }],
          take: 500,
        }),
        tx.tenantMembership.findMany({
          where: {
            tenantId: policy.scope.tenantId,
            status: "ACTIVE",
            user: { status: "ACTIVE" },
            ...(executiveOnly ? { id: policy.scope.membershipId } : {}),
            OR: [{ tenantRole: { code: { in: ["field_executive", "sales_executive", "executive"] } } }, { user: { role: "FIELD_EXECUTIVE" } }],
          },
          select: { id: true, designation: true, tenantRole: { select: { name: true } }, team: { select: { name: true } }, user: { select: { fullName: true, avatarUrl: true } } },
          orderBy: [{ user: { fullName: "asc" } }, { id: "asc" }],
        }),
      ]);
      return {
        leads: leads.map((lead) => ({ ...lead, displayName: lead.businessName || lead.name })),
        executives: executives.map((member) => ({ id: member.id, name: member.user.fullName, avatarUrl: member.user.avatarUrl, role: member.designation || member.tenantRole?.name || "Field Executive", team: member.team?.name || null })),
      };
    });
  }

  async create(actor: RequestPrincipal, body: unknown) {
    const value = createDemo.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require("crm.demos.manage");
      const { tenantId, membershipId } = policy.scope;
      const lead = await tx.lead.findFirst({
        where: { tenantId, id: value.leadId, deletedAt: null, ...(isFieldExecutive(policy) ? { assignedMembershipId: membershipId } : {}) },
        select: { id: true, businessName: true, name: true },
      });
      if (!lead) throw new NotFoundException("Lead not found");
      const executiveMembershipId = value.conductedByMembershipId ?? membershipId;
      if (isFieldExecutive(policy) && executiveMembershipId !== membershipId) throw new ForbiddenException("Field executives can only schedule their own demos.");
      const executive = await this.executive(tx, tenantId, executiveMembershipId);
      const row = await tx.leadDemo.create({
        data: {
          tenantId,
          leadId: lead.id,
          conductedByMembershipId: executive.id,
          conductedByName: executive.user.fullName,
          conductedByAvatar: executive.user.avatarUrl,
          demoCode: await generateDemoCode(tx, tenantId),
          demoTitle: value.demoTitle,
          demoDate: value.demoDate,
          demoTime: normalizeTime(value.demoTime),
          demoType: value.demoType,
          demoMode: value.demoMode,
          productService: value.productService,
          attendeesCount: value.attendeesCount,
          feedbackRating: 0,
          keyQuestions: value.keyQuestions,
          status: "SCHEDULED",
          outcome: "PENDING",
        },
        select: demoSelect,
      });
      await tx.leadHistory.create({ data: { tenantId, leadId: lead.id, eventType: "demo_scheduled", message: `Product demo scheduled: ${value.demoTitle}`, note: value.keyQuestions, actorMembershipId: membershipId, metadata: { demoId: row.id, demoCode: row.demoCode } } });
      return row;
    });
  }

  async update(actor: RequestPrincipal, id: string, body: unknown) {
    crmId.parse(id);
    const value = updateDemo.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require("crm.demos.manage");
      const existing = await tx.leadDemo.findFirst({ where: { ...this.scope(policy), id }, select: { id: true, leadId: true, status: true, conductedByMembershipId: true } });
      if (!existing) throw new NotFoundException("Demo not found");
      let executive: Awaited<ReturnType<DemoService["executive"]>> | undefined;
      if (value.conductedByMembershipId && value.conductedByMembershipId !== existing.conductedByMembershipId) {
        if (isFieldExecutive(policy)) throw new ForbiddenException("Field executives cannot reassign demos.");
        executive = await this.executive(tx, policy.scope.tenantId, value.conductedByMembershipId);
      }
      const completedAt = value.status === "COMPLETED" ? new Date() : value.status ? null : undefined;
      const startedAt = value.status === "IN_PROGRESS" ? new Date() : value.status === "SCHEDULED" || value.status === "RESCHEDULED" ? null : undefined;
      const cancelledAt = value.status === "CANCELLED" || value.status === "NO_SHOW" ? new Date() : value.status ? null : undefined;
      const row = await tx.leadDemo.update({
        where: { id },
        data: {
          ...value,
          ...(value.demoTime ? { demoTime: normalizeTime(value.demoTime) } : {}),
          ...(executive ? { conductedByName: executive.user.fullName, conductedByAvatar: executive.user.avatarUrl } : {}),
          ...(completedAt !== undefined ? { completedAt } : {}),
          ...(startedAt !== undefined ? { startedAt } : {}),
          ...(cancelledAt !== undefined ? { cancelledAt } : {}),
        },
        select: demoSelect,
      });
      await tx.leadHistory.create({ data: { tenantId: policy.scope.tenantId, leadId: existing.leadId, eventType: "demo_updated", message: value.status ? `Demo updated to ${value.status}` : "Demo details updated", note: value.keyQuestions, actorMembershipId: policy.scope.membershipId, metadata: { demoId: row.id, statusBefore: existing.status, statusAfter: row.status } } });
      return row;
    });
  }

  async remove(actor: RequestPrincipal, id: string) {
    crmId.parse(id);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require("crm.demos.manage");
      const row = await tx.leadDemo.findFirst({ where: { ...this.scope(policy), id }, select: { id: true, leadId: true, demoTitle: true, status: true } });
      if (!row) throw new NotFoundException("Demo not found");
      if (["IN_PROGRESS", "COMPLETED"].includes(row.status)) throw new UnprocessableEntityException("Started or completed demos cannot be deleted.");
      await tx.leadDemo.delete({ where: { id } });
      await tx.leadHistory.create({ data: { tenantId: policy.scope.tenantId, leadId: row.leadId, eventType: "demo_deleted", message: `Demo deleted: ${row.demoTitle}`, actorMembershipId: policy.scope.membershipId, metadata: { demoId: row.id } } });
      return { deleted: true };
    });
  }

  async navigationSummary(actor: RequestPrincipal) {
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.demos.view");
      const scope = this.scope(policy);
      const today = localDate(await this.timezone(tx, policy.scope.tenantId));
      const [all, todayCount, scheduled, completed] = await Promise.all([
        tx.leadDemo.count({ where: scope }),
        tx.leadDemo.count({ where: { ...scope, demoDate: today } }),
        tx.leadDemo.count({ where: { ...scope, status: { in: ["SCHEDULED", "CONFIRMED", "RESCHEDULED"] } } }),
        tx.leadDemo.count({ where: { ...scope, status: "COMPLETED" } }),
      ]);
      return { all, today: todayCount, scheduled, completed };
    });
  }

  async conversionReport(actor: RequestPrincipal, input: unknown) {
    const query = demoReportQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.demos.view");
      const scope: Prisma.LeadDemoWhereInput = {
        ...this.scope(policy),
        ...(query.from || query.to ? { demoDate: {
          ...(query.from ? { gte: query.from } : {}),
          ...(query.to ? { lte: query.to } : {}),
        } } : {}),
      };
      const rows = await tx.leadDemo.findMany({ where: scope, select: demoSelect, orderBy: { demoDate: "desc" } });
      const completed = rows.filter((row) => row.status === "COMPLETED");
      const converted = rows.filter((row) => row.outcome === "CONVERTED" || row.lead.status === "CONVERTED");
      const interested = rows.filter((row) => ["INTERESTED", "FOLLOW_UP", "PROPOSAL", "TRIAL", "CONVERTED"].includes(row.outcome));
      const proposals = rows.filter((row) => ["PROPOSAL", "QUOTATION_SENT", "CONVERTED"].includes(row.outcome));
      const valueConverted = converted.reduce((total, row) => total + Number(row.lead.opportunity?.amount ?? row.lead.estimatedValue ?? 0), 0);
      const closeDurations = converted.flatMap((row) => row.lead.convertedAt
        ? [Math.max(0, (row.lead.convertedAt.getTime() - new Date(`${row.demoDate}T00:00:00.000Z`).getTime()) / 86_400_000)]
        : []);
      const groups = new Map<string, { name: string; demos: number; converted: number; revenue: number }>();
      for (const row of rows) {
        const group = groups.get(row.conductedByMembershipId) ?? { name: row.conductedByName, demos: 0, converted: 0, revenue: 0 };
        group.demos += 1;
        if (row.outcome === "CONVERTED" || row.lead.status === "CONVERTED") {
          group.converted += 1;
          group.revenue += Number(row.lead.opportunity?.amount ?? row.lead.estimatedValue ?? 0);
        }
        groups.set(row.conductedByMembershipId, group);
      }
      const leaderboard = [...groups.values()].map((row) => ({ ...row, conversionRate: row.demos ? Math.round((row.converted / row.demos) * 1000) / 10 : 0 })).sort((a, b) => b.converted - a.converted || b.demos - a.demos);
      const sourceGroups = new Map<string, { source: string; demos: number; converted: number }>();
      for (const row of rows) {
        const source = row.lead.sourceValue?.name ?? "Direct";
        const group = sourceGroups.get(source) ?? { source, demos: 0, converted: 0 };
        group.demos += 1;
        if (row.outcome === "CONVERTED" || row.lead.status === "CONVERTED") group.converted += 1;
        sourceGroups.set(source, group);
      }
      const sources = [...sourceGroups.values()].map((row) => ({ ...row, conversionRate: row.demos ? Math.round((row.converted / row.demos) * 1000) / 10 : 0 })).sort((a, b) => b.conversionRate - a.conversionRate || b.demos - a.demos);
      return { summary: { total: rows.length, completed: completed.length, interested: interested.length, proposals: proposals.length, converted: converted.length, conversionRate: rows.length ? Math.round((converted.length / rows.length) * 1000) / 10 : 0, valueConverted, averageDaysToClose: closeDurations.length ? Math.round((closeDurations.reduce((sum, days) => sum + days, 0) / closeDurations.length) * 10) / 10 : 0 }, leaderboard, sources };
    });
  }
}
