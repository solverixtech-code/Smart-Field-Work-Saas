import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmRepository } from "./crm.repository";
import { parseFollowUpSchedule } from "./follow-up-schedule";
import { crmId } from "./crm-contract";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const range = z.object({ startDate: date, endDate: date }).strict().refine(
  ({ startDate, endDate }) => startDate <= endDate,
  "Start date must be on or before end date.",
);

function localDay(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

@Injectable()
export class FieldDashboardService {
  constructor(private readonly repo: CrmRepository) {}

  async get(actor: RequestPrincipal, input: unknown) {
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.dashboard.view");
      const { tenantId, membershipId } = policy.scope;
      const settings = await tx.tenantSettings.findUnique({
        where: { tenantId }, select: { timezone: true },
      });
      const timezone = settings?.timezone ?? "Asia/Kolkata";
      const today = localDay(timezone);
      const selected = range.parse(input && Object.keys(input).length ? input : { startDate: today, endDate: today });
      const start = parseFollowUpSchedule(selected.startDate, "12:00 AM", timezone);
      const after = new Date(`${selected.endDate}T00:00:00Z`);
      after.setUTCDate(after.getUTCDate() + 1);
      const end = parseFollowUpSchedule(after.toISOString().slice(0, 10), "12:00 AM", timezone);
      const days = (Date.parse(`${selected.endDate}T00:00:00Z`) - Date.parse(`${selected.startDate}T00:00:00Z`)) / 86400_000 + 1;
      if (days > 92) {
        throw new BadRequestException("Choose a date range of 92 days or fewer.");
      }
      const visitWhere = {
        tenantId, executiveMembershipId: membershipId,
        checkInTime: { gte: start, lt: end },
        status: { not: "CANCELLED" },
        lead: { is: { deletedAt: null } },
      };
      const demoWhere = {
        tenantId, conductedByMembershipId: membershipId,
        demoDate: { gte: selected.startDate, lte: selected.endDate },
        lead: { is: { deletedAt: null } },
      };
      const [visits, visitCount, completedVisits, followUpsDue, demos, completedDemos, territories, attendance, assignedShift] = await Promise.all([
        tx.leadVisit.findMany({
          where: visitWhere, orderBy: { checkInTime: "asc" }, take: 100,
          select: {
            id: true, leadId: true, checkInTime: true, checkOutTime: true,
            location: true, latitude: true, longitude: true, purpose: true, status: true,
            lead: { select: { name: true, businessName: true, leadCode: true } },
          },
        }),
        tx.leadVisit.count({ where: visitWhere }),
        tx.leadVisit.count({ where: { ...visitWhere, status: "COMPLETED" } }),
        tx.leadFollowUp.count({ where: {
          tenantId, assignedMembershipId: membershipId, status: "Pending",
          scheduledDate: { gte: selected.startDate, lte: selected.endDate },
          lead: { is: { deletedAt: null } },
        } }),
        tx.leadDemo.count({ where: demoWhere }),
        tx.leadDemo.count({ where: { ...demoWhere, status: "COMPLETED" } }),
        tx.territoryMember.findMany({
          where: { tenantId, membershipId, territory: { deletedAt: null, status: "ACTIVE" } },
          select: { territory: { select: {
            name: true,
            targets: { where: { period: selected.endDate.slice(0, 7) }, select: { monthlyTarget: true, monthlyAchieved: true } },
          } } },
        }),
        tx.attendance.findFirst({
          where: { tenantId, tenantMembershipId: membershipId, date: new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`) },
          select: { punchInTime: true, punchOutTime: true, totalWorkMinutes: true },
        }),
        tx.userShift.findFirst({
          where: {
            tenantId, tenantMembershipId: membershipId,
            startDate: { lte: new Date() },
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
          },
          orderBy: { startDate: "desc" },
          select: { shift: { select: { name: true, startTime: true, endTime: true } } },
        }),
      ]);
      const targetAmount = territories.reduce((total, item) => total + Number(item.territory.targets[0]?.monthlyTarget ?? 0), 0);
      const achievedAmount = territories.reduce((total, item) => total + Number(item.territory.targets[0]?.monthlyAchieved ?? 0), 0);
      return {
        ...selected, today, timezone,
        summary: {
          visitCount, completedVisits, followUpsDue, demos, completedDemos,
          target: territories.some((item) => item.territory.targets.length) ? {
            amount: targetAmount, achieved: achievedAmount,
            percentage: targetAmount > 0 ? Math.round(achievedAmount / targetAmount * 1000) / 10 : 0,
          } : null,
        },
        territoryNames: territories.map((item) => item.territory.name),
        visits: visits.map((visit) => ({
          id: visit.id, leadId: visit.leadId, leadCode: visit.lead.leadCode,
          name: visit.lead.businessName || visit.lead.name,
          scheduledAt: visit.checkInTime, checkOutTime: visit.checkOutTime,
          location: visit.location, latitude: visit.latitude, longitude: visit.longitude,
          purpose: visit.purpose, status: visit.status,
        })),
        attendance: {
          punchInTime: attendance?.punchInTime ?? null,
          punchOutTime: attendance?.punchOutTime ?? null,
          totalWorkMinutes: attendance?.totalWorkMinutes ?? 0,
          shift: assignedShift?.shift ?? null,
        },
      };
    });
  }

  async checkIn(actor: RequestPrincipal, visitId: string) {
    crmId.parse(visitId);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require("crm.visits.checkin");
      const visit = await tx.leadVisit.findFirst({
        where: { id: visitId, tenantId: policy.scope.tenantId, executiveMembershipId: policy.scope.membershipId,
          lead: { is: { deletedAt: null } } },
        select: { id: true, status: true, checkInTime: true },
      });
      if (!visit) throw new NotFoundException("Visit not found.");
      if (visit.status !== "SCHEDULED") throw new ConflictException("Only scheduled visits can be checked in.");
      const settings = await tx.tenantSettings.findUnique({
        where: { tenantId: policy.scope.tenantId }, select: { timezone: true },
      });
      const timezone = settings?.timezone ?? "Asia/Kolkata";
      const today = localDay(timezone);
      const tomorrow = new Date(`${today}T00:00:00Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      if (visit.checkInTime < parseFollowUpSchedule(today, "12:00 AM", timezone) ||
        visit.checkInTime >= parseFollowUpSchedule(tomorrow.toISOString().slice(0, 10), "12:00 AM", timezone)) {
        throw new ConflictException("This visit is not scheduled for today.");
      }
      const result = await tx.leadVisit.updateMany({
        where: { id: visit.id, tenantId: policy.scope.tenantId, executiveMembershipId: policy.scope.membershipId, status: "SCHEDULED" },
        data: { status: "IN_PROGRESS" },
      });
      if (result.count !== 1) throw new ConflictException("Visit was changed. Refresh and try again.");
      return { status: "IN_PROGRESS" };
    });
  }

  async complete(actor: RequestPrincipal, visitId: string, input: unknown) {
    crmId.parse(visitId);
    const { outcome } = z.object({ outcome: z.string().trim().min(1).max(2000) }).strict().parse(input);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require("crm.visits.checkin");
      const visit = await tx.leadVisit.findFirst({
        where: { id: visitId, tenantId: policy.scope.tenantId, executiveMembershipId: policy.scope.membershipId,
          lead: { is: { deletedAt: null } } },
        select: { id: true, status: true },
      });
      if (!visit) throw new NotFoundException("Visit not found.");
      if (visit.status !== "IN_PROGRESS") throw new ConflictException("Only checked-in visits can be completed.");
      const result = await tx.leadVisit.updateMany({
        where: { id: visit.id, tenantId: policy.scope.tenantId, executiveMembershipId: policy.scope.membershipId, status: "IN_PROGRESS" },
        data: { status: "COMPLETED", outcome, checkOutTime: new Date() },
      });
      if (result.count !== 1) throw new ConflictException("Visit was changed. Refresh and try again.");
      return { status: "COMPLETED" };
    });
  }
}
