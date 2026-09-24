import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import * as dto from "./crm-contract";
import { CrmPolicy } from "./crm-policy";
import { CrmRepository, crmConflict } from "./crm.repository";
import {
  accountSelect,
  contactSelect,
  AccountRow,
  ContactRow,
  ownerSelect,
  ownerOption,
} from "./crm-select";

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
const accountData = (v: Partial<z.infer<typeof dto.accountFields>>) => ({
  name: v.name,
  businessTypeValueId: v.businessTypeValueId,
  sourceValueId: v.sourceValueId,
  categoryLabel: v.categoryLabel,
  status: v.status,
  ownerMembershipId: v.ownerMembershipId,
  addressLine1: v.addressLine1,
  addressLine2: v.addressLine2,
  city: v.city,
  state: v.state,
  postalCode: v.postalCode,
  countryCode: v.countryCode,
  website: v.website,
  gstin: v.gstin,
  establishedYear: v.establishedYear,
  description: v.description,
});
const contactData = (v: Partial<z.infer<typeof dto.contactFields>>) => ({
  name: v.name,
  phone: v.phone,
  email: v.email,
  roleValueId: v.roleValueId,
  status: v.status,
});

function phoneSearch(search: string): Prisma.ContactWhereInput[] {
  const normalized = search.replace(/[\s()-]/g, "");
  return normalized ? [{ phone: { contains: normalized } }] : [];
}

function monthStart(date: Date, offset = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function minutesBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

@Injectable()
export class CrmService {
  constructor(private readonly repo: CrmRepository) {}
  async getLeadAssigneeProfile(actor: RequestPrincipal, membershipId: string) {
    dto.crmId.parse(membershipId);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.executives.view");
      const membership = await tx.tenantMembership.findFirst({
        where: { id: membershipId, tenantId: policy.scope.tenantId },
        select: {
          id: true,
          status: true,
          employeeCode: true,
          designation: true,
          department: true,
          joinedAt: true,
          tenantRole: { select: { name: true, code: true } },
          team: { select: { name: true, tenantId: true } },
          managerMembership: {
            select: {
              tenantId: true,
              employeeCode: true,
              user: { select: { fullName: true, employeeCode: true } },
            },
          },
          user: {
            select: {
              fullName: true,
              avatarUrl: true,
              role: true,
              email: true,
              mobile: true,
              employeeCode: true,
              officeAddress: true,
              joinedAt: true,
            },
          },
        },
      });
      if (!membership) throw new NotFoundException("Employee not found");

      const now = new Date();
      const currentStart = monthStart(now);
      const nextStart = monthStart(now, 1);
      const previousStart = monthStart(now, -1);
      const trendStart = monthStart(now, -5);
      const tenantId = policy.scope.tenantId;
      const leadWhere = { tenantId, assignedMembershipId: membershipId, deletedAt: null };
      const opportunityWhere = { tenantId, assignedMembershipId: membershipId, deletedAt: null };

      const [leads, opportunities, visits, attendance, territories, communications, histories] = await Promise.all([
        tx.lead.findMany({
          where: leadWhere,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, leadCode: true, name: true, businessName: true, status: true,
            estimatedValue: true, createdAt: true, convertedAt: true,
            sourceValue: { select: { name: true } },
          },
        }),
        tx.opportunity.findMany({
          where: opportunityWhere,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true, dealCode: true, title: true, amount: true, stage: true,
            createdAt: true, updatedAt: true, closedAt: true,
            account: { select: { name: true } },
          },
        }),
        tx.leadVisit.findMany({
          where: { tenantId, executiveMembershipId: membershipId, checkInTime: { gte: trendStart } },
          orderBy: { checkInTime: "desc" },
          take: 500,
          select: {
            id: true, targetName: true, targetType: true, location: true, purpose: true,
            visitType: true, status: true, outcome: true, checkInTime: true,
            checkOutTime: true, durationMinutes: true, latitude: true, longitude: true,
          },
        }),
        tx.attendance.findMany({
          where: { tenantId, tenantMembershipId: membershipId, date: { gte: currentStart, lt: nextStart } },
          orderBy: { date: "asc" },
          select: {
            id: true, date: true, status: true, punchInTime: true, punchOutTime: true,
            totalWorkMinutes: true, lateMinutes: true, remarks: true,
          },
        }),
        tx.territoryMember.findMany({
          where: { tenantId, membershipId, territory: { deletedAt: null } },
          select: {
            territory: {
              select: {
                name: true, city: true, regionArea: true,
                targets: {
                  where: { period: monthKey(now) },
                  select: {
                    monthlyTarget: true, monthlyAchieved: true,
                    visitTarget: true, visitAchieved: true,
                    newBusinessTarget: true, newBusinessAchieved: true,
                  },
                },
              },
            },
          },
        }),
        tx.leadCommunication.findMany({
          where: { tenantId, loggedByMembershipId: membershipId },
          orderBy: { timestamp: "desc" },
          take: 8,
          select: { id: true, channel: true, subject: true, details: true, timestamp: true },
        }),
        tx.leadHistory.findMany({
          where: { tenantId, actorMembershipId: membershipId },
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, eventType: true, message: true, note: true, createdAt: true },
        }),
      ]);

      const monthStats = (start: Date, end: Date) => {
        const assigned = leads.filter((lead) => lead.createdAt >= start && lead.createdAt < end).length;
        const converted = leads.filter((lead) => lead.convertedAt && lead.convertedAt >= start && lead.convertedAt < end).length;
        const won = opportunities.filter((deal) => deal.stage.toLowerCase() === "won" && (deal.closedAt ?? deal.updatedAt) >= start && (deal.closedAt ?? deal.updatedAt) < end);
        return {
          leadsAssigned: assigned,
          leadsConverted: converted,
          dealsWon: won.length,
          revenue: won.reduce((sum, deal) => sum + Number(deal.amount), 0),
        };
      };
      const current = monthStats(currentStart, nextStart);
      const previous = monthStats(previousStart, currentStart);
      const trend = Array.from({ length: 6 }, (_, index) => {
        const start = monthStart(now, index - 5);
        const end = monthStart(now, index - 4);
        return { month: monthLabel(start), ...monthStats(start, end) };
      });
      const wonDeals = opportunities.filter((deal) => deal.stage.toLowerCase() === "won");
      const currentVisits = visits.filter((visit) => visit.checkInTime >= currentStart && visit.checkInTime < nextStart);
      const completedVisits = currentVisits.filter((visit) => visit.status === "COMPLETED");
      const target = territories.reduce((result, item) => {
        const row = item.territory.targets[0];
        if (!row) return result;
        result.revenueTarget += Number(row.monthlyTarget);
        result.revenueAchieved += Number(row.monthlyAchieved);
        result.visitTarget += row.visitTarget;
        result.visitAchieved += row.visitAchieved;
        result.newBusinessTarget += row.newBusinessTarget;
        result.newBusinessAchieved += row.newBusinessAchieved;
        result.hasData = true;
        return result;
      }, { revenueTarget: 0, revenueAchieved: 0, visitTarget: 0, visitAchieved: 0, newBusinessTarget: 0, newBusinessAchieved: 0, hasData: false });

      const sourceCounts = new Map<string, number>();
      for (const lead of leads) {
        const source = lead.sourceValue?.name ?? "Not specified";
        sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
      }
      const routeDays = new Map<string, typeof visits>();
      for (const visit of visits) {
        const key = visit.checkInTime.toISOString().slice(0, 10);
        routeDays.set(key, [...(routeDays.get(key) ?? []), visit]);
      }
      const attendanceCounts = new Map<string, number>();
      for (const item of attendance) attendanceCounts.set(item.status, (attendanceCounts.get(item.status) ?? 0) + 1);
      const attendanceMinutes = attendance.reduce((sum, item) => sum + item.totalWorkMinutes, 0);
      const activity = [
        ...communications.map((item) => ({
          id: item.id, type: `${item.channel} logged`, description: item.subject || item.details || "Communication recorded",
          occurredAt: item.timestamp, tag: "Communication",
        })),
        ...histories.map((item) => ({
          id: item.id, type: item.eventType.replaceAll("_", " "), description: item.message || item.note || "Lead activity recorded",
          occurredAt: item.createdAt, tag: "Lead",
        })),
        ...visits.slice(0, 8).map((item) => ({
          id: item.id, type: `Visit ${item.status.toLowerCase()}`, description: `${item.targetName} - ${item.purpose}`,
          occurredAt: item.checkOutTime ?? item.checkInTime, tag: "Visit",
        })),
      ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, 8);

      const joinedAt = membership.joinedAt ?? membership.user.joinedAt;
      const teamName = membership.team?.tenantId === tenantId || membership.team?.tenantId === null
        ? membership.team.name : null;
      const manager = membership.managerMembership?.tenantId === tenantId ? membership.managerMembership : null;
      const address = membership.user.officeAddress
        ?? territories.map((item) => item.territory.city || item.territory.regionArea).find(Boolean)
        ?? null;
      const totalAssigned = leads.length;
      const totalConverted = leads.filter((lead) => lead.convertedAt !== null).length;
      const conversionRate = totalAssigned ? Math.round((totalConverted / totalAssigned) * 10_000) / 100 : 0;
      const currentAttendanceWorkingDays = attendance.length;
      const presentDays = (attendanceCounts.get("PRESENT") ?? 0) + (attendanceCounts.get("LATE") ?? 0) + (attendanceCounts.get("HALF_DAY") ?? 0);

      return {
        id: membership.id,
        employeeCode: membership.employeeCode ?? membership.user.employeeCode,
        displayName: membership.user.fullName,
        avatarUrl: membership.user.avatarUrl,
        role: membership.designation ?? membership.tenantRole?.name ?? membership.user.role.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()),
        department: membership.department,
        status: membership.status,
        email: membership.user.email,
        mobile: membership.user.mobile,
        address,
        teamName,
        managerName: manager?.user.fullName ?? null,
        managerEmployeeCode: manager?.employeeCode ?? manager?.user.employeeCode ?? null,
        joinedAt: joinedAt.toISOString(),
        employmentType: null,
        overview: {
          totals: {
            leadsAssigned: totalAssigned,
            leadsConverted: totalConverted,
            dealsWon: wonDeals.length,
            revenue: wonDeals.reduce((sum, deal) => sum + Number(deal.amount), 0),
            conversionRate,
          },
          changes: {
            leadsAssigned: percentChange(current.leadsAssigned, previous.leadsAssigned),
            leadsConverted: percentChange(current.leadsConverted, previous.leadsConverted),
            dealsWon: percentChange(current.dealsWon, previous.dealsWon),
            revenue: percentChange(current.revenue, previous.revenue),
          },
          target: target.hasData ? {
            period: monthLabel(currentStart),
            target: target.revenueTarget,
            achieved: target.revenueAchieved,
            percentage: target.revenueTarget ? Math.round((target.revenueAchieved / target.revenueTarget) * 10_000) / 100 : 0,
          } : null,
          trend,
          recentActivity: activity.map((item) => ({ ...item, occurredAt: item.occurredAt.toISOString() })),
        },
        performance: {
          period: monthLabel(currentStart),
          targets: target.hasData ? [
            { label: "Revenue Target", achieved: target.revenueAchieved, target: target.revenueTarget, kind: "currency" },
            { label: "Visit Target", achieved: target.visitAchieved, target: target.visitTarget, kind: "number" },
            { label: "New Business Target", achieved: target.newBusinessAchieved, target: target.newBusinessTarget, kind: "number" },
          ] : [],
          trend,
          leadsBySource: Array.from(sourceCounts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
          visitCompletionRate: currentVisits.length ? Math.round((completedVisits.length / currentVisits.length) * 10_000) / 100 : 0,
        },
        routeHistory: {
          totalDays: routeDays.size,
          totalVisits: visits.length,
          completedVisits: visits.filter((visit) => visit.status === "COMPLETED").length,
          totalDurationMinutes: visits.reduce((sum, visit) => sum + (visit.durationMinutes || minutesBetween(visit.checkInTime, visit.checkOutTime)), 0),
          days: Array.from(routeDays, ([date, dayVisits]) => ({
            date,
            firstCheckIn: dayVisits.at(-1)?.checkInTime.toISOString() ?? null,
            lastCheckOut: dayVisits.find((visit) => visit.checkOutTime)?.checkOutTime?.toISOString() ?? null,
            visits: dayVisits.length,
            completed: dayVisits.filter((visit) => visit.status === "COMPLETED").length,
            durationMinutes: dayVisits.reduce((sum, visit) => sum + (visit.durationMinutes || minutesBetween(visit.checkInTime, visit.checkOutTime)), 0),
          })).sort((a, b) => b.date.localeCompare(a.date)),
          points: visits.filter((visit) => visit.latitude !== null && visit.longitude !== null).slice(0, 100).map((visit) => ({
            id: visit.id, name: visit.targetName, location: visit.location,
            latitude: visit.latitude as number, longitude: visit.longitude as number,
            timestamp: visit.checkInTime.toISOString(), status: visit.status,
          })),
        },
        attendance: {
          period: monthLabel(currentStart),
          summary: {
            present: presentDays,
            absent: attendanceCounts.get("ABSENT") ?? 0,
            late: attendanceCounts.get("LATE") ?? 0,
            halfDay: attendanceCounts.get("HALF_DAY") ?? 0,
            workingDays: currentAttendanceWorkingDays,
            percentage: currentAttendanceWorkingDays ? Math.round((presentDays / currentAttendanceWorkingDays) * 10_000) / 100 : 0,
            averageWorkMinutes: currentAttendanceWorkingDays ? Math.round(attendanceMinutes / currentAttendanceWorkingDays) : 0,
          },
          days: attendance.map((item) => ({
            id: item.id, date: item.date.toISOString().slice(0, 10), status: item.status,
            punchInTime: item.punchInTime?.toISOString() ?? null,
            punchOutTime: item.punchOutTime?.toISOString() ?? null,
            totalWorkMinutes: item.totalWorkMinutes, lateMinutes: item.lateMinutes, remarks: item.remarks,
          })),
        },
        visits: {
          summary: {
            total: currentVisits.length,
            completed: completedVisits.length,
            scheduled: currentVisits.filter((visit) => visit.status === "SCHEDULED").length,
            cancelled: currentVisits.filter((visit) => visit.status === "CANCELLED").length,
            productive: completedVisits.filter((visit) => Boolean(visit.outcome?.trim())).length,
          },
          items: currentVisits.map((visit) => ({
            id: visit.id, targetName: visit.targetName, targetType: visit.targetType,
            location: visit.location, purpose: visit.purpose, visitType: visit.visitType,
            status: visit.status, outcome: visit.outcome, checkInTime: visit.checkInTime.toISOString(),
            checkOutTime: visit.checkOutTime?.toISOString() ?? null, durationMinutes: visit.durationMinutes,
          })),
        },
        sales: {
          summary: { ...current, pipelineValue: opportunities.filter((deal) => !["won", "lost"].includes(deal.stage.toLowerCase())).reduce((sum, deal) => sum + Number(deal.amount), 0) },
          trend,
          stages: Array.from(opportunities.reduce((map, deal) => map.set(deal.stage, (map.get(deal.stage) ?? 0) + 1), new Map<string, number>()), ([stage, count]) => ({ stage, count })),
          wonDeals: wonDeals.map((deal) => ({
            id: deal.id, dealCode: deal.dealCode, title: deal.title,
            customer: deal.account?.name ?? null, amount: Number(deal.amount),
            wonAt: (deal.closedAt ?? deal.updatedAt).toISOString(),
          })),
        },
        incentives: { available: false, message: "No incentive payout records are available for this executive." },
      };
    });
  }
  private authorize(p: CrmPolicy, resource: dto.CrmResource, action: string) {
    p.require(`crm.${resource}.${action}`);
    p.requireScope(resource);
  }
  private async accountMasters(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    v: Partial<z.infer<typeof dto.accountFields>>,
  ) {
    await this.repo.master(tx, p, v.businessTypeValueId, "business_type");
    await this.repo.master(tx, p, v.sourceValueId, "lead_source");
  }
  private async bumpAccount(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    row: AccountRow,
    data: Prisma.AccountUncheckedUpdateManyInput = {},
  ) {
    const result = await tx.account.updateMany({
      where: { AND: [p.accounts(), { id: row.id, revision: row.revision }] },
      data: {
        ...data,
        revision: { increment: 1 },
        updatedByMembershipId: p.scope.membershipId,
      },
    });
    if (result.count !== 1) crmConflict("CRM_STALE_REVISION");
  }
  private async changeContact(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    row: ContactRow,
    revision: number,
    data: Prisma.ContactUncheckedUpdateManyInput,
  ) {
    const result = await tx.contact.updateMany({
      where: { AND: [p.contacts(), { id: row.id, revision }] },
      data: {
        ...data,
        revision: { increment: 1 },
        updatedByMembershipId: p.scope.membershipId,
      },
    });
    if (result.count !== 1) crmConflict("CRM_STALE_REVISION");
  }
  async listAccounts(actor: RequestPrincipal, query: unknown) {
    const q = dto.accountQuery.parse(query);
    return this.repo.run(actor, false, async (tx, p) => {
      this.authorize(p, "businesses", "view");
      const search: Prisma.AccountWhereInput[] = q.search
        ? [
            { name: { contains: q.search, mode: "insensitive" } },
            { city: { contains: q.search, mode: "insensitive" } },
          ]
        : [];
      if (q.search && p.canSeeContacts())
        search.push({
          contacts: {
            some: {
              AND: [
                p.contacts(),
                {
                  isPrimary: true,
                  OR: [
                    { name: { contains: q.search, mode: "insensitive" } },
                    ...phoneSearch(q.search),
                  ],
                },
              ],
            },
          },
        });
      const where: Prisma.AccountWhereInput = {
        AND: [
          p.accounts(),
          {
            status: q.status,
            businessTypeValueId: q.businessTypeValueId,
            sourceValueId: q.sourceValueId,
            city: q.city ? { equals: q.city, mode: "insensitive" } : undefined,
            ownerMembershipId: q.ownerMembershipId,
          },
          ...(search.length ? [{ OR: search }] : []),
        ],
      };
      const total = await tx.account.count({ where });
      const rows = await tx.account.findMany({
        where,
        select: accountSelect,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [{ [q.sortBy]: q.sortDirection }, { id: q.sortDirection }],
      });
      return page(await this.repo.accountsDto(tx, p, rows), total, q);
    });
  }
  async getAccount(actor: RequestPrincipal, id: string) {
    dto.crmId.parse(id);
    return this.repo.run(actor, false, async (tx, p) => {
      this.authorize(p, "businesses", "view");
      return (
        await this.repo.accountsDto(tx, p, [await this.repo.account(tx, p, id)])
      )[0];
    });
  }
  async createAccount(actor: RequestPrincipal, body: unknown) {
    const v = dto.createAccount.parse(body);
    return this.repo.run(actor, true, (tx, p) =>
      this.createAccountInTransaction(tx, p, v),
    );
  }
  async createAccountInTransaction(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    input: z.infer<typeof dto.createAccount>,
  ) {
    const v = dto.createAccount.parse(input);
    this.authorize(p, "businesses", "create");
    const owner = v.ownerMembershipId ?? p.scope.membershipId;
    p.targetOwner("businesses", owner);
    await this.repo.owner(tx, p, owner);
    await this.accountMasters(tx, p, v);
    if (v.primaryContact) {
      this.authorize(p, "contacts", "create");
      await this.repo.master(
        tx,
        p,
        v.primaryContact.roleValueId,
        "contact_role",
      );
    }
    const row = await tx.account.create({
      data: {
        ...accountData(v),
        name: v.name,
        ownerMembershipId: owner,
        tenantId: p.scope.tenantId,
        createdByMembershipId: p.scope.membershipId,
        updatedByMembershipId: p.scope.membershipId,
      },
      select: accountSelect,
    });
    await this.repo.audit(tx, p, "account.created", "Account", row.id, {
      revisionAfter: 1,
      status: row.status,
      ownerMembershipId: owner,
    });
    if (v.primaryContact) {
      const contact = await tx.contact.create({
        data: {
          ...contactData(v.primaryContact),
          name: v.primaryContact.name,
          tenantId: p.scope.tenantId,
          accountId: row.id,
          ownerMembershipId: null,
          isPrimary: true,
          createdByMembershipId: p.scope.membershipId,
          updatedByMembershipId: p.scope.membershipId,
        },
        select: { id: true },
      });
      await this.repo.audit(tx, p, "contact.created", "Contact", contact.id, {
        accountId: row.id,
        revisionAfter: 1,
        status: "ACTIVE",
      });
      await this.repo.audit(
        tx,
        p,
        "account.primary_contact.changed",
        "Account",
        row.id,
        { primaryContactId: contact.id, revisionAfter: 1 },
      );
    }
    return (await this.repo.accountsDto(tx, p, [row]))[0];
  }
  async updateAccount(actor: RequestPrincipal, id: string, body: unknown) {
    dto.crmId.parse(id);
    const v = dto.updateAccount.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      this.authorize(p, "businesses", "update");
      const row = await this.repo.account(tx, p, id, true);
      if (
        v.ownerMembershipId !== undefined &&
        v.ownerMembershipId !== row.ownerMembershipId
      ) {
        p.require("crm.businesses.assign");
        p.targetOwner("businesses", v.ownerMembershipId);
      }
      if (v.ownerMembershipId !== undefined)
        await this.repo.owner(tx, p, v.ownerMembershipId);
      await this.accountMasters(tx, p, v);
      await this.bumpAccount(
        tx,
        p,
        { ...row, revision: v.expectedRevision },
        accountData(v),
      );
      const fields = Object.keys(v).filter((k) => k !== "expectedRevision");
      await this.repo.audit(tx, p, "account.updated", "Account", id, {
        changedFields: fields,
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
      });
      if (v.ownerMembershipId && v.ownerMembershipId !== row.ownerMembershipId)
        await this.repo.audit(tx, p, "account.owner.changed", "Account", id, {
          ownerBefore: row.ownerMembershipId,
          ownerAfter: v.ownerMembershipId,
          revisionAfter: row.revision + 1,
        });
      const updated = await tx.account.findUniqueOrThrow({
        where: { id_tenantId: { id, tenantId: p.scope.tenantId } },
        select: accountSelect,
      });
      return (await this.repo.accountsDto(tx, p, [updated]))[0];
    });
  }
  async deleteAccount(actor: RequestPrincipal, id: string, body: unknown) {
    dto.crmId.parse(id);
    const v = dto.revisionCommand.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      this.authorize(p, "businesses", "delete");
      const row = await this.repo.account(tx, p, id, true);
      if (
        await tx.contact.count({
          where: { tenantId: p.scope.tenantId, accountId: id, deletedAt: null },
        })
      )
        crmConflict("CRM_ACCOUNT_HAS_CONTACTS");
      await this.bumpAccount(
        tx,
        p,
        { ...row, revision: v.expectedRevision },
        { deletedAt: new Date() },
      );
      await this.repo.audit(tx, p, "account.deleted", "Account", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
      });
    });
  }
  async listContacts(
    actor: RequestPrincipal,
    query: unknown,
    accountId?: string,
  ) {
    if (accountId) dto.crmId.parse(accountId);
    const q = dto.contactQuery.parse(
      accountId ? { ...dto.nestedContactQuery.parse(query), accountId } : query,
    );
    return this.repo.run(actor, false, async (tx, p) => {
      this.authorize(p, "contacts", "view");
      if (q.accountId) {
        p.require("crm.businesses.view");
        await this.repo.account(tx, p, q.accountId);
      }
      const where: Prisma.ContactWhereInput = {
        AND: [
          p.contacts(),
          {
            accountId: q.standalone ? null : q.accountId,
            status: q.status,
            roleValueId: q.roleValueId,
            ...(q.ownerMembershipId
              ? {
                  OR: [
                    { accountId: null, ownerMembershipId: q.ownerMembershipId },
                    {
                      account: {
                        is: { ownerMembershipId: q.ownerMembershipId },
                      },
                    },
                  ],
                }
              : {}),
          },
          ...(q.search
            ? [
                {
                  OR: [
                    {
                      name: {
                        contains: q.search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      email: {
                        contains: q.search,
                        mode: "insensitive" as const,
                      },
                    },
                    ...phoneSearch(q.search),
                  ],
                },
              ]
            : []),
        ],
      };
      const total = await tx.contact.count({ where });
      const rows = await tx.contact.findMany({
        where,
        select: contactSelect,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [{ [q.sortBy]: q.sortDirection }, { id: q.sortDirection }],
      });
      return page(await this.repo.contactsDto(tx, p, rows), total, q);
    });
  }
  async getContact(actor: RequestPrincipal, id: string) {
    dto.crmId.parse(id);
    return this.repo.run(actor, false, async (tx, p) => {
      this.authorize(p, "contacts", "view");
      return (
        await this.repo.contactsDto(tx, p, [await this.repo.contact(tx, p, id)])
      )[0];
    });
  }
  async createContact(
    actor: RequestPrincipal,
    body: unknown,
    accountId?: string,
  ) {
    if (accountId) dto.crmId.parse(accountId);
    const v = dto.createContact.parse(
      accountId ? { ...dto.createLinkedContact.parse(body), accountId } : body,
    );
    return this.repo.run(actor, true, (tx, p) =>
      this.createContactInTransaction(tx, p, v),
    );
  }
  async createContactInTransaction(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    input: z.infer<typeof dto.createContact>,
  ) {
    const v = dto.createContact.parse(input);
    this.authorize(p, "contacts", "create");
    let parent: AccountRow | undefined;
    let owner: string | null = null;
    if (v.accountId) {
      this.authorize(p, "businesses", "update");
      p.require("crm.businesses.view");
      parent = await this.repo.account(tx, p, v.accountId, true);
      if (parent.status !== "ACTIVE")
        throw new UnprocessableEntityException("CRM_ACCOUNT_INACTIVE");
    } else {
      owner = v.ownerMembershipId ?? p.scope.membershipId;
      p.targetOwner("contacts", owner);
      await this.repo.owner(tx, p, owner);
    }
    await this.repo.master(tx, p, v.roleValueId, "contact_role");
    const row = await tx.contact.create({
      data: {
        ...contactData(v),
        name: v.name,
        tenantId: p.scope.tenantId,
        accountId: v.accountId ?? null,
        ownerMembershipId: owner,
        createdByMembershipId: p.scope.membershipId,
        updatedByMembershipId: p.scope.membershipId,
      },
      select: contactSelect,
    });
    if (parent) await this.bumpAccount(tx, p, parent);
    await this.repo.audit(tx, p, "contact.created", "Contact", row.id, {
      accountId: row.accountId,
      ownerMembershipId: owner,
      revisionAfter: 1,
      status: row.status,
    });
    return (await this.repo.contactsDto(tx, p, [row]))[0];
  }
  async updateContact(actor: RequestPrincipal, id: string, body: unknown) {
    dto.crmId.parse(id);
    const v = dto.updateContact.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      this.authorize(p, "contacts", "update");
      const row = await this.repo.contact(tx, p, id, true);
      if (row.accountId) {
        this.authorize(p, "businesses", "update");
        if (v.ownerMembershipId !== undefined)
          throw new BadRequestException(
            "Linked contacts inherit business ownership",
          );
      }
      if (row.isPrimary && v.status && v.status !== "ACTIVE")
        crmConflict("CRM_PRIMARY_CONTACT_REQUIRED_CHANGE");
      if (
        !row.accountId &&
        v.ownerMembershipId &&
        v.ownerMembershipId !== row.ownerMembershipId
      ) {
        p.require("crm.contacts.assign");
        p.targetOwner("contacts", v.ownerMembershipId);
      }
      if (v.ownerMembershipId !== undefined)
        await this.repo.owner(tx, p, v.ownerMembershipId);
      await this.repo.master(tx, p, v.roleValueId, "contact_role");
      await this.changeContact(tx, p, row, v.expectedRevision, {
        ...contactData(v),
        ownerMembershipId: v.ownerMembershipId,
      });
      if (row.accountId && row.isPrimary)
        await this.bumpAccount(
          tx,
          p,
          await this.repo.account(tx, p, row.accountId),
        );
      await this.repo.audit(tx, p, "contact.updated", "Contact", id, {
        changedFields: Object.keys(v).filter((k) => k !== "expectedRevision"),
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
      });
      if (v.ownerMembershipId && v.ownerMembershipId !== row.ownerMembershipId)
        await this.repo.audit(tx, p, "contact.owner.changed", "Contact", id, {
          ownerBefore: row.ownerMembershipId,
          ownerAfter: v.ownerMembershipId,
          revisionAfter: row.revision + 1,
        });
      return (
        await this.repo.contactsDto(tx, p, [
          await tx.contact.findUniqueOrThrow({
            where: { id_tenantId: { id, tenantId: p.scope.tenantId } },
            select: contactSelect,
          }),
        ])
      )[0];
    });
  }
  async deleteContact(actor: RequestPrincipal, id: string, body: unknown) {
    dto.crmId.parse(id);
    const v = dto.revisionCommand.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      this.authorize(p, "contacts", "delete");
      const row = await this.repo.contact(tx, p, id, true);
      if (row.accountId) this.authorize(p, "businesses", "update");
      if (row.isPrimary) crmConflict("CRM_PRIMARY_CONTACT_REQUIRED_CHANGE");
      await this.changeContact(tx, p, row, v.expectedRevision, {
        deletedAt: new Date(),
      });
      if (row.accountId)
        await this.bumpAccount(
          tx,
          p,
          await this.repo.account(tx, p, row.accountId),
        );
      await this.repo.audit(tx, p, "contact.deleted", "Contact", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
      });
    });
  }
  async setPrimary(actor: RequestPrincipal, id: string, body: unknown) {
    dto.crmId.parse(id);
    const v = dto.primaryCommand.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      this.authorize(p, "businesses", "update");
      this.authorize(p, "contacts", "update");
      const account = await this.repo.account(tx, p, id, true);
      await this.bumpAccount(tx, p, {
        ...account,
        revision: v.expectedRevision,
      });
      // Validate the exact parent before taking a child lock; never lock a second Account.
      const target = v.contactId
        ? await tx.contact.findFirst({
            where: { AND: [p.contacts(), { id: v.contactId, accountId: id }] },
            select: contactSelect,
          })
        : null;
      if (v.contactId && !target)
        throw new NotFoundException("CRM_CONTACT_NOT_FOUND");
      if (target && target.status !== "ACTIVE")
        throw new UnprocessableEntityException("CRM_CONTACT_INACTIVE");
      const old = await tx.contact.findFirst({
        where: {
          tenantId: p.scope.tenantId,
          accountId: id,
          deletedAt: null,
          isPrimary: true,
        },
        select: contactSelect,
      });
      const changed: ContactRow[] = [];
      if (old && old.id !== target?.id) {
        await this.changeContact(tx, p, old, old.revision, {
          isPrimary: false,
        });
        changed.push(old);
      }
      if (target && target.id !== old?.id) {
        await this.changeContact(tx, p, target, target.revision, {
          isPrimary: true,
        });
        changed.push(target);
      }
      for (const contact of changed)
        await this.repo.audit(tx, p, "contact.updated", "Contact", contact.id, {
          changedFields: ["isPrimary"],
          revisionBefore: contact.revision,
          revisionAfter: contact.revision + 1,
        });
      await this.repo.audit(
        tx,
        p,
        "account.primary_contact.changed",
        "Account",
        id,
        {
          primaryBefore: old?.id ?? null,
          primaryAfter: target?.id ?? null,
          revisionBefore: account.revision,
          revisionAfter: account.revision + 1,
        },
      );
      const changedRows = await tx.contact.findMany({
        where: {
          AND: [p.contacts(), { id: { in: changed.map((c) => c.id) } }],
        },
        select: contactSelect,
        take: 2,
        orderBy: { id: "asc" },
      });
      return {
        account: (
          await this.repo.accountsDto(tx, p, [
            await this.repo.account(tx, p, id),
          ])
        )[0],
        changedContacts: p.canSeeContacts()
          ? await this.repo.contactsDto(tx, p, changedRows)
          : [],
      };
    });
  }
  async owners(actor: RequestPrincipal, query: unknown) {
    const q = dto.ownerQuery.parse(query);
    return this.repo.run(actor, false, async (tx, p) => {
      if (
        !(["businesses", "contacts"] as const).some(
          (r) => p.has(`crm.${r}.assign`) && p.hasScope(r),
        )
      )
        throw new ForbiddenException("CRM_PERMISSION_DENIED");
      const where: Prisma.TenantMembershipWhereInput = {
        tenantId: p.scope.tenantId,
        status: "ACTIVE",
        user: {
          status: "ACTIVE",
          ...(q.search
            ? { fullName: { contains: q.search, mode: "insensitive" } }
            : {}),
        },
      };
      const total = await tx.tenantMembership.count({ where });
      const rows = await tx.tenantMembership.findMany({
        where,
        select: ownerSelect,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [{ user: { fullName: "asc" } }, { id: "asc" }],
      });
      return page(
        rows.map(ownerOption),
        total,
        q,
      );
    });
  }
}
