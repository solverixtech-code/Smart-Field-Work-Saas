import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmRepository } from "./crm.repository";
import { crmId } from "./crm-contract";
import { isFieldExecutive, leadScope } from "./lead-policy";

const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    view: z
      .enum(["all", "today", "upcoming", "overdue", "completed"])
      .default("all"),
    search: z.string().trim().max(200).optional(),
    assignedMembershipId: crmId.optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict()
  .refine(
    (query) =>
      !query.dateFrom || !query.dateTo || query.dateFrom <= query.dateTo,
    { message: "From date must be on or before to date.", path: ["dateFrom"] },
  );

const followUpSelect = {
  id: true,
  leadId: true,
  assignedMembershipId: true,
  assignedToName: true,
  title: true,
  scheduledDate: true,
  scheduledTime: true,
  notes: true,
  status: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  assignedMembership: {
    select: {
      designation: true,
      user: { select: { fullName: true, avatarUrl: true } },
      team: { select: { name: true } },
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
      city: true,
      priority: true,
      status: true,
    },
  },
} satisfies Prisma.LeadFollowUpSelect;

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
export class FollowUpService {
  constructor(private readonly repo: CrmRepository) {}

  async list(actor: RequestPrincipal, input: unknown) {
    const query = listQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.followups.view");
      const scope = leadScope(policy);
      const settings = await tx.tenantSettings.findUnique({
        where: { tenantId: policy.scope.tenantId },
        select: { timezone: true },
      });
      const today = localDate(settings?.timezone ?? "Asia/Kolkata");
      const base: Prisma.LeadFollowUpWhereInput = {
        tenantId: policy.scope.tenantId,
        lead: { is: scope },
        ...(isFieldExecutive(policy)
          ? { assignedMembershipId: policy.scope.membershipId }
          : {}),
      };
      const where: Prisma.LeadFollowUpWhereInput = {
        ...base,
        ...(query.assignedMembershipId
          ? { assignedMembershipId: query.assignedMembershipId }
          : {}),
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: "insensitive" } },
                {
                  lead: {
                    is: {
                      name: { contains: query.search, mode: "insensitive" },
                    },
                  },
                },
                {
                  lead: {
                    is: {
                      businessName: {
                        contains: query.search,
                        mode: "insensitive",
                      },
                    },
                  },
                },
                {
                  lead: {
                    is: {
                      contactName: {
                        contains: query.search,
                        mode: "insensitive",
                      },
                    },
                  },
                },
                {
                  lead: {
                    is: {
                      leadCode: { contains: query.search, mode: "insensitive" },
                    },
                  },
                },
              ],
            }
          : {}),
        AND: [
          query.view === "completed"
            ? { status: "Completed" }
            : query.view === "today"
              ? { status: "Pending", scheduledDate: today }
              : query.view === "upcoming"
                ? { status: "Pending", scheduledDate: { gt: today } }
                : query.view === "overdue"
                  ? { status: "Pending", scheduledDate: { lt: today } }
                  : {},
          query.dateFrom || query.dateTo
            ? {
                scheduledDate: {
                  ...(query.dateFrom ? { gte: query.dateFrom } : {}),
                  ...(query.dateTo ? { lte: query.dateTo } : {}),
                },
              }
            : {},
        ],
      };
      const [total, items, completed, pending, overdue, todayCount] =
        await Promise.all([
          tx.leadFollowUp.count({ where }),
          tx.leadFollowUp.findMany({
            where,
            select: followUpSelect,
            orderBy: [
              { scheduledDate: "asc" },
              { scheduledTime: "asc" },
              { id: "asc" },
            ],
            skip: (query.page - 1) * query.limit,
            take: query.limit,
          }),
          tx.leadFollowUp.count({ where: { ...base, status: "Completed" } }),
          tx.leadFollowUp.count({ where: { ...base, status: "Pending" } }),
          tx.leadFollowUp.count({
            where: { ...base, status: "Pending", scheduledDate: { lt: today } },
          }),
          tx.leadFollowUp.count({
            where: { ...base, status: "Pending", scheduledDate: today },
          }),
        ]);
      return {
        items,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
        today,
        summary: { completed, pending, overdue, today: todayCount },
      };
    });
  }

  async get(actor: RequestPrincipal, id: string) {
    crmId.parse(id);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.followups.view");
      const item = await tx.leadFollowUp.findFirst({
        where: {
          id,
          tenantId: policy.scope.tenantId,
          lead: { is: leadScope(policy) },
          ...(isFieldExecutive(policy)
            ? { assignedMembershipId: policy.scope.membershipId }
            : {}),
        },
        select: followUpSelect,
      });
      if (!item) throw new NotFoundException("Follow-up not found");
      return item;
    });
  }
}
