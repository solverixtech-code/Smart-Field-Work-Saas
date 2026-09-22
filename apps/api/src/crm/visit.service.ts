import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { crmId } from "./crm-contract";
import { CrmRepository } from "./crm.repository";
import { parseFollowUpSchedule } from "./follow-up-schedule";
import { isFieldExecutive, leadScope } from "./lead-policy";
import {
  scheduleVisit,
  visitAvailabilityQuery,
  visitExecutiveOptionsQuery,
} from "./visit-contract";

const visitListQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    view: z
      .enum(["all", "today", "scheduled", "completed", "missed", "verified", "unverified"])
      .default("all"),
    search: z.string().trim().max(200).optional(),
    executiveMembershipId: crmId.optional(),
  })
  .strict();

const visitSelect = {
  id: true,
  leadId: true,
  accountId: true,
  targetType: true,
  targetName: true,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  executiveMembershipId: true,
  createdByMembershipId: true,
  executiveName: true,
  executiveAvatar: true,
  checkInTime: true,
  checkOutTime: true,
  scheduledEndTime: true,
  durationMinutes: true,
  location: true,
  latitude: true,
  longitude: true,
  purpose: true,
  visitType: true,
  priority: true,
  recurrence: true,
  routeArea: true,
  travelMode: true,
  geofenceRadiusMeters: true,
  allowManualCheckIn: true,
  instructions: true,
  checklist: true,
  outcome: true,
  photos: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  executiveMembership: {
    select: {
      designation: true,
      user: {
        select: {
          fullName: true,
          avatarUrl: true,
          mobile: true,
          email: true,
        },
      },
      team: { select: { name: true } },
    },
  },
  lead: {
    select: {
      id: true,
      leadCode: true,
      name: true,
      businessName: true,
      phone: true,
      email: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      priority: true,
      status: true,
      accountId: true,
    },
  },
  account: {
    select: {
      id: true,
      name: true,
      categoryLabel: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      status: true,
    },
  },
} satisfies Prisma.LeadVisitSelect;

function localDate(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

const activeTarget: Prisma.LeadVisitWhereInput = {
  OR: [
    { leadId: null },
    { lead: { is: { deletedAt: null } } },
  ],
};

function nextDate(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

@Injectable()
export class VisitService {
  constructor(private readonly repo: CrmRepository) {}

  private async timezone(tx: Prisma.TransactionClient, tenantId: string) {
    const settings = await tx.tenantSettings.findUnique({
      where: { tenantId },
      select: { timezone: true },
    });
    return settings?.timezone ?? "Asia/Kolkata";
  }

  private scheduleWindow(
    scheduledDate: string,
    startTime: string,
    endTime: string,
    timezone: string,
  ) {
    const start = parseFollowUpSchedule(scheduledDate, startTime, timezone);
    const end = parseFollowUpSchedule(scheduledDate, endTime, timezone);
    if (end <= start) {
      throw new BadRequestException("End time must be after start time.");
    }
    return { start, end };
  }

  private async schedulableExecutive(
    tx: Prisma.TransactionClient,
    tenantId: string,
    membershipId: string,
  ) {
    const membership = await tx.tenantMembership.findFirst({
      where: {
        id: membershipId,
        tenantId,
        status: "ACTIVE",
        user: { status: "ACTIVE" },
        OR: [
          {
            tenantRole: {
              code: { in: ["field_executive", "sales_executive", "executive"] },
            },
          },
          { user: { role: "FIELD_EXECUTIVE" } },
        ],
      },
      select: {
        id: true,
        designation: true,
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
            mobile: true,
            email: true,
          },
        },
        tenantRole: { select: { name: true } },
        team: { select: { name: true } },
      },
    });
    if (!membership) throw new NotFoundException("Field executive not found");
    return membership;
  }

  private conflictWhere(
    tenantId: string,
    executiveMembershipId: string,
    start: Date,
    end: Date,
  ): Prisma.LeadVisitWhereInput {
    return {
      tenantId,
      executiveMembershipId,
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      checkInTime: { lt: end },
      OR: [
        { scheduledEndTime: { gt: start } },
        {
          scheduledEndTime: null,
          checkInTime: { gte: start, lt: end },
        },
      ],
    };
  }

  async executiveOptions(actor: RequestPrincipal, input: unknown) {
    const query = visitExecutiveOptionsQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.visits.schedule");
      const { tenantId, membershipId } = policy.scope;
      const timezone = await this.timezone(tx, tenantId);
      const date = query.date ?? localDate(timezone);
      const start = parseFollowUpSchedule(date, "12:00 AM", timezone);
      const end = parseFollowUpSchedule(nextDate(date), "12:00 AM", timezone);
      const rows = await tx.tenantMembership.findMany({
        where: {
          tenantId,
          status: "ACTIVE",
          user: { status: "ACTIVE" },
          ...(isFieldExecutive(policy) ? { id: membershipId } : {}),
          OR: [
            {
              tenantRole: {
                code: { in: ["field_executive", "sales_executive", "executive"] },
              },
            },
            { user: { role: "FIELD_EXECUTIVE" } },
          ],
        },
        select: {
          id: true,
          designation: true,
          tenantRole: { select: { name: true } },
          team: { select: { name: true } },
          territoryMemberships: {
            where: { territory: { deletedAt: null, status: "ACTIVE" } },
            select: { territory: { select: { name: true } } },
          },
          user: { select: { fullName: true, avatarUrl: true } },
          _count: {
            select: {
              executiveVisits: {
                where: {
                  status: { in: ["SCHEDULED", "IN_PROGRESS"] },
                  checkInTime: { gte: start, lt: end },
                },
              },
            },
          },
        },
        orderBy: [{ user: { fullName: "asc" } }, { id: "asc" }],
      });
      return {
        date,
        items: rows.map((row) => ({
          id: row.id,
          name: row.user.fullName,
          avatarUrl: row.user.avatarUrl,
          role: row.designation ?? row.tenantRole?.name ?? "Field Executive",
          team: row.team?.name ?? null,
          territories: row.territoryMemberships.map((item) => item.territory.name),
          scheduledVisitCount: row._count.executiveVisits,
        })),
      };
    });
  }

  async availability(actor: RequestPrincipal, input: unknown) {
    const query = visitAvailabilityQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.visits.schedule");
      const { tenantId, membershipId } = policy.scope;
      const executiveMembershipId = query.executiveMembershipId ?? membershipId;
      if (isFieldExecutive(policy) && executiveMembershipId !== membershipId) {
        throw new ForbiddenException("Field executives can only schedule their own visits.");
      }
      await this.schedulableExecutive(tx, tenantId, executiveMembershipId);
      const timezone = await this.timezone(tx, tenantId);
      const { start, end } = this.scheduleWindow(
        query.scheduledDate,
        query.startTime,
        query.endTime,
        timezone,
      );
      const dayStart = parseFollowUpSchedule(query.scheduledDate, "12:00 AM", timezone);
      const dayEnd = parseFollowUpSchedule(nextDate(query.scheduledDate), "12:00 AM", timezone);
      const [conflictingVisitCount, scheduledVisitCount] = await Promise.all([
        tx.leadVisit.count({
          where: this.conflictWhere(tenantId, executiveMembershipId, start, end),
        }),
        tx.leadVisit.count({
          where: {
            tenantId,
            executiveMembershipId,
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            checkInTime: { gte: dayStart, lt: dayEnd },
          },
        }),
      ]);
      return {
        available: conflictingVisitCount === 0,
        conflictingVisitCount,
        scheduledVisitCount,
      };
    });
  }

  async create(actor: RequestPrincipal, body: unknown) {
    const value = scheduleVisit.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require("crm.visits.schedule");
      const { tenantId, membershipId } = policy.scope;
      const executiveMembershipId = value.executiveMembershipId ?? membershipId;
      if (isFieldExecutive(policy) && executiveMembershipId !== membershipId) {
        throw new ForbiddenException("Field executives can only schedule their own visits.");
      }
      const executive = await this.schedulableExecutive(
        tx,
        tenantId,
        executiveMembershipId,
      );

      let leadId: string | null = null;
      let accountId: string | null = null;
      let targetName = value.targetName;
      if (value.targetType === "LEAD") {
        policy.require("crm.leads.view");
        const lead = await tx.lead.findFirst({
          where: { AND: [leadScope(policy), { id: value.targetId }] },
          select: { id: true, name: true, businessName: true },
        });
        if (!lead) throw new NotFoundException("Lead not found");
        leadId = lead.id;
        targetName = lead.businessName || lead.name;
      } else if (value.targetType === "ACCOUNT") {
        policy.require("crm.businesses.view");
        const account = await tx.account.findFirst({
          where: { AND: [policy.accounts(), { id: value.targetId }] },
          select: { id: true, name: true },
        });
        if (!account) throw new NotFoundException("Business account not found");
        accountId = account.id;
        targetName = account.name;
      }

      const timezone = await this.timezone(tx, tenantId);
      const { start, end } = this.scheduleWindow(
        value.scheduledDate,
        value.startTime,
        value.endTime,
        timezone,
      );
      if (start < new Date()) {
        throw new BadRequestException("Choose a future visit time.");
      }
      const conflict = await tx.leadVisit.findFirst({
        where: this.conflictWhere(tenantId, executiveMembershipId, start, end),
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException("The selected executive already has a visit during this time.");
      }

      const visit = await tx.leadVisit.create({
        data: {
          tenantId,
          leadId,
          accountId,
          targetType: value.targetType,
          targetName,
          contactName: value.contactName,
          contactPhone: value.contactPhone,
          contactEmail: value.contactEmail,
          executiveMembershipId,
          createdByMembershipId: membershipId,
          executiveName: executive.user.fullName,
          executiveAvatar: executive.user.avatarUrl,
          checkInTime: start,
          scheduledEndTime: end,
          durationMinutes: Math.ceil((end.getTime() - start.getTime()) / 60_000),
          location: value.location,
          latitude: value.latitude ?? null,
          longitude: value.longitude ?? null,
          geofenceRadiusMeters: value.geofenceRadiusMeters,
          purpose: value.purpose,
          visitType: value.visitType,
          priority: value.priority,
          recurrence: value.recurrence,
          routeArea: value.routeArea,
          travelMode: value.travelMode,
          allowManualCheckIn: value.allowManualCheckIn,
          instructions: value.instructions,
          checklist: value.checklist,
          photos: [],
          status: "SCHEDULED",
        },
        select: visitSelect,
      });
      await this.repo.audit(tx, policy, "visit.scheduled", "LeadVisit", visit.id, {
        assignedAfter: executiveMembershipId,
        title: targetName,
      });
      return visit;
    });
  }

  async list(actor: RequestPrincipal, input: unknown) {
    const query = visitListQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.visits.view");
      const { tenantId, membershipId } = policy.scope;
      const settings = await tx.tenantSettings.findUnique({
        where: { tenantId },
        select: { timezone: true },
      });
      const timezone = settings?.timezone ?? "Asia/Kolkata";
      const today = localDate(timezone);
      const startOfToday = parseFollowUpSchedule(today, "12:00 AM", timezone);
      const tomorrow = new Date(`${today}T00:00:00.000Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const startOfTomorrow = parseFollowUpSchedule(
        tomorrow.toISOString().slice(0, 10),
        "12:00 AM",
        timezone,
      );

      const scope: Prisma.LeadVisitWhereInput = {
        tenantId,
        AND: [activeTarget],
        ...(isFieldExecutive(policy)
          ? { executiveMembershipId: membershipId }
          : query.executiveMembershipId
            ? { executiveMembershipId: query.executiveMembershipId }
            : {}),
      };
      const view: Prisma.LeadVisitWhereInput =
        query.view === "today"
          ? { checkInTime: { gte: startOfToday, lt: startOfTomorrow } }
          : query.view === "scheduled"
            ? { status: { in: ["SCHEDULED", "IN_PROGRESS"] } }
            : query.view === "completed"
              ? { status: "COMPLETED" }
              : query.view === "missed"
                ? { status: { in: ["MISSED", "CANCELLED"] } }
                : query.view === "verified"
                  ? { latitude: { not: null }, longitude: { not: null } }
                  : query.view === "unverified"
                    ? { OR: [{ latitude: null }, { longitude: null }] }
                    : {};
      const where: Prisma.LeadVisitWhereInput = {
        ...scope,
        AND: [
          activeTarget,
          view,
          ...(query.search
            ? [
                {
                  OR: [
                    { targetName: { contains: query.search, mode: "insensitive" as const } },
                    { purpose: { contains: query.search, mode: "insensitive" as const } },
                    { location: { contains: query.search, mode: "insensitive" as const } },
                    { executiveName: { contains: query.search, mode: "insensitive" as const } },
                    { lead: { is: { leadCode: { contains: query.search, mode: "insensitive" as const } } } },
                    { lead: { is: { name: { contains: query.search, mode: "insensitive" as const } } } },
                    { lead: { is: { businessName: { contains: query.search, mode: "insensitive" as const } } } },
                  ],
                },
              ]
            : []),
        ],
      };

      const [total, items, all, todayCount, scheduled, completed, missed, verified, unverified] =
        await Promise.all([
          tx.leadVisit.count({ where }),
          tx.leadVisit.findMany({
            where,
            select: visitSelect,
            orderBy: [{ checkInTime: "desc" }, { id: "desc" }],
            skip: (query.page - 1) * query.limit,
            take: query.limit,
          }),
          tx.leadVisit.count({ where: scope }),
          tx.leadVisit.count({ where: { ...scope, checkInTime: { gte: startOfToday, lt: startOfTomorrow } } }),
          tx.leadVisit.count({ where: { ...scope, status: { in: ["SCHEDULED", "IN_PROGRESS"] } } }),
          tx.leadVisit.count({ where: { ...scope, status: "COMPLETED" } }),
          tx.leadVisit.count({ where: { ...scope, status: { in: ["MISSED", "CANCELLED"] } } }),
          tx.leadVisit.count({ where: { ...scope, latitude: { not: null }, longitude: { not: null } } }),
          tx.leadVisit.count({ where: { ...scope, OR: [{ latitude: null }, { longitude: null }] } }),
        ]);

      return {
        items,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
        today,
        summary: { all, today: todayCount, scheduled, completed, missed, verified, unverified },
      };
    });
  }

  async get(actor: RequestPrincipal, id: string) {
    crmId.parse(id);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.visits.view");
      const item = await tx.leadVisit.findFirst({
        where: {
          id,
          tenantId: policy.scope.tenantId,
          AND: [activeTarget],
          ...(isFieldExecutive(policy)
            ? { executiveMembershipId: policy.scope.membershipId }
            : {}),
        },
        select: visitSelect,
      });
      if (!item) throw new NotFoundException("Visit not found");
      return item;
    });
  }
}
