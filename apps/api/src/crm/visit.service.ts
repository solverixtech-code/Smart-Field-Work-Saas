import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { crmId } from "./crm-contract";
import { CrmRepository } from "./crm.repository";
import { parseFollowUpSchedule } from "./follow-up-schedule";
import { isFieldExecutive } from "./lead-policy";

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
  executiveMembershipId: true,
  executiveName: true,
  executiveAvatar: true,
  checkInTime: true,
  checkOutTime: true,
  durationMinutes: true,
  location: true,
  latitude: true,
  longitude: true,
  purpose: true,
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

@Injectable()
export class VisitService {
  constructor(private readonly repo: CrmRepository) {}

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
        lead: { is: { deletedAt: null } },
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
          view,
          ...(query.search
            ? [
                {
                  OR: [
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
          lead: { is: { deletedAt: null } },
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
