import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmRepository } from "./crm.repository";
import { parseFollowUpSchedule } from "./follow-up-schedule";

const mapQuery = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict();

const routeQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict();

const palette = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#6366F1", "#F97316"];

function localDateKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function nextDateKey(date: string) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLng = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}

@Injectable()
export class MapService {
  constructor(private readonly repo: CrmRepository) {}

  async snapshot(actor: RequestPrincipal, input: unknown) {
    const query = mapQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.map.view");
      const tenantId = policy.scope.tenantId;
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? "Asia/Kolkata";
      const today = localDateKey(new Date(), timezone);
      const startDate = query.startDate ?? today;
      const endDate = query.endDate ?? today;
      if (startDate > endDate) throw new BadRequestException("Start date must be on or before end date.");
      const rangeDays = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000 + 1;
      if (rangeDays > 366) throw new BadRequestException("Choose a date range of 366 days or fewer.");
      const start = parseFollowUpSchedule(startDate, "12:00 AM", timezone);
      const end = parseFollowUpSchedule(nextDateKey(endDate), "12:00 AM", timezone);
      const period = endDate.slice(0, 7);

      const [memberships, visits, punches, territories, opportunities] = await Promise.all([
        tx.tenantMembership.findMany({
          where: {
            tenantId, status: "ACTIVE",
            OR: [
              { tenantRole: { code: { in: ["field_executive", "sales_executive", "executive"] } } },
              { user: { role: "FIELD_EXECUTIVE" } },
            ],
          },
          orderBy: { user: { fullName: "asc" } },
          select: {
            id: true, employeeCode: true, team: { select: { name: true } },
            user: { select: { fullName: true, avatarUrl: true, mobile: true } },
          },
        }),
        tx.leadVisit.findMany({
          where: { tenantId, checkInTime: { gte: start, lt: end }, status: { not: "CANCELLED" } },
          orderBy: { checkInTime: "asc" },
          take: 5000,
          select: {
            id: true, leadId: true, accountId: true, targetType: true, targetName: true,
            contactName: true, contactPhone: true, executiveMembershipId: true,
            executiveName: true, executiveAvatar: true, checkInTime: true, checkOutTime: true,
            durationMinutes: true, location: true, latitude: true, longitude: true,
            status: true, outcome: true, routeArea: true,
            lead: { select: { status: true, priority: true, territory: { select: { name: true } } } },
            account: { select: { status: true, categoryLabel: true, territory: { select: { name: true } } } },
          },
        }),
        tx.punchLog.findMany({
          where: { tenantId, timestamp: { gte: start, lt: end }, tenantMembershipId: { not: null } },
          orderBy: { timestamp: "asc" },
          take: 5000,
          select: { id: true, tenantMembershipId: true, type: true, timestamp: true, latitude: true, longitude: true, locationName: true },
        }),
        tx.territory.findMany({
          where: { tenantId, deletedAt: null, status: "ACTIVE" },
          orderBy: { name: "asc" },
          select: {
            id: true, code: true, name: true, color: true, regionArea: true, city: true,
            boundaryPoints: { orderBy: { sequence: "asc" }, select: { latitude: true, longitude: true } },
            _count: { select: { members: true } },
            targets: { where: { period }, take: 1, select: { monthlyTarget: true, monthlyAchieved: true } },
          },
        }),
        tx.opportunity.findMany({
          where: {
            tenantId, deletedAt: null, stage: { equals: "won", mode: "insensitive" },
            OR: [{ closedAt: { gte: start, lt: end } }, { closedAt: null, updatedAt: { gte: start, lt: end } }],
          },
          select: { id: true, amount: true, closedAt: true, updatedAt: true, leadId: true, accountId: true },
        }),
      ]);

      const visitsByMember = new Map<string, typeof visits>();
      visits.forEach((visit) => visitsByMember.set(visit.executiveMembershipId, [...(visitsByMember.get(visit.executiveMembershipId) ?? []), visit]));
      const punchesByMember = new Map<string, typeof punches>();
      punches.forEach((punch) => {
        if (!punch.tenantMembershipId) return;
        punchesByMember.set(punch.tenantMembershipId, [...(punchesByMember.get(punch.tenantMembershipId) ?? []), punch]);
      });

      const executives = memberships.map((member) => {
        const memberVisits = visitsByMember.get(member.id) ?? [];
        const memberPunches = punchesByMember.get(member.id) ?? [];
        const locatedVisits = memberVisits.filter((visit) => visit.latitude != null && visit.longitude != null);
        const lastVisit = locatedVisits.at(-1);
        const lastPunch = memberPunches.at(-1);
        const useVisit = lastVisit && (!lastPunch || lastVisit.checkInTime >= lastPunch.timestamp);
        const latestAt = useVisit ? lastVisit?.checkInTime : lastPunch?.timestamp;
        const openAttendance = memberPunches.length > 0 && memberPunches.at(-1)?.type === "PUNCH_IN";
        const activeVisit = [...memberVisits].reverse().find((visit) => visit.status === "IN_PROGRESS");
        const status = activeVisit ? "On Field" : openAttendance ? "In Transit" : "Offline";
        const points = [
          ...memberPunches.map((point) => ({ latitude: point.latitude, longitude: point.longitude, at: point.timestamp })),
          ...locatedVisits.map((point) => ({ latitude: point.latitude!, longitude: point.longitude!, at: point.checkInTime })),
        ].sort((a, b) => a.at.getTime() - b.at.getTime());
        const distanceKmToday = points.slice(1).reduce((total, point, index) => total + haversineKm(points[index], point), 0);
        return {
          id: member.id,
          code: member.employeeCode ?? member.id,
          name: member.user.fullName,
          avatar: member.user.avatarUrl,
          status,
          currentLocation: useVisit ? lastVisit?.location : lastPunch?.locationName ?? "Location not reported",
          lastUpdatedAt: latestAt ?? null,
          batteryLevel: null,
          lat: useVisit ? lastVisit?.latitude : lastPunch?.latitude,
          lng: useVisit ? lastVisit?.longitude : lastPunch?.longitude,
          phone: member.user.mobile,
          team: member.team?.name ?? "Not assigned",
          visitsTodayCompleted: memberVisits.filter((visit) => visit.status === "COMPLETED").length,
          visitsTodayTotal: memberVisits.length,
          distanceKmToday: Math.round(distanceKmToday * 10) / 10,
          speedKmh: null,
        };
      });

      const geotaggedVisits = visits.filter((visit) => visit.latitude != null && visit.longitude != null);
      const prospectsByTarget = new Map<string, typeof geotaggedVisits[number]>();
      geotaggedVisits.forEach((visit) => prospectsByTarget.set(visit.accountId ?? visit.leadId ?? visit.id, visit));
      const prospects = [...prospectsByTarget.entries()].map(([id, visit]) => {
        const isCustomer = Boolean(visit.accountId) || visit.lead?.status === "CONVERTED";
        const status = isCustomer ? "Customer" : visit.lead?.status === "DISQUALIFIED" ? "Not Interested" : visit.status === "COMPLETED" ? "Visited" : "Follow-up";
        return {
          id, name: visit.targetName, category: visit.account?.categoryLabel ?? visit.targetType,
          address: visit.location, status,
          markerColor: status === "Customer" ? "star" : status === "Visited" ? "green" : status === "Not Interested" ? "red" : "yellow",
          contactPerson: visit.contactName ?? "Not provided", phone: visit.contactPhone ?? "Not provided",
          lastVisitAt: visit.checkInTime, lat: visit.latitude!, lng: visit.longitude!,
          region: visit.account?.territory?.name ?? visit.lead?.territory?.name ?? visit.routeArea ?? "Unassigned",
          detailPath: visit.accountId ? `/admin/businesses/${visit.accountId}` : visit.leadId ? `/admin/leads/${visit.leadId}` : "/admin/businesses",
        };
      });

      const visitClusters = new Map<string, { id: string; areaName: string; lat: number; lng: number; count: number; occurredAt: Date }>();
      geotaggedVisits.forEach((visit) => {
        const key = `${visit.location}|${visit.latitude!.toFixed(3)}|${visit.longitude!.toFixed(3)}`;
        const current = visitClusters.get(key);
        visitClusters.set(key, current
          ? { ...current, count: current.count + 1, occurredAt: visit.checkInTime > current.occurredAt ? visit.checkInTime : current.occurredAt }
          : { id: visit.id, areaName: visit.location, lat: visit.latitude!, lng: visit.longitude!, count: 1, occurredAt: visit.checkInTime });
      });
      const maxVisitsAtPoint = Math.max(1, ...[...visitClusters.values()].map((cluster) => cluster.count));
      const visitHeatmap = [...visitClusters.values()].map((cluster) => ({
        ...cluster, intensity: cluster.count / maxVisitsAtPoint, value: cluster.count,
      }));
      const visitByTarget = new Map<string, typeof geotaggedVisits[number]>();
      geotaggedVisits.forEach((visit) => {
        if (visit.leadId) visitByTarget.set(`lead:${visit.leadId}`, visit);
        if (visit.accountId) visitByTarget.set(`account:${visit.accountId}`, visit);
      });
      const locatedSales = opportunities.flatMap((opportunity) => {
        const visit = opportunity.leadId ? visitByTarget.get(`lead:${opportunity.leadId}`) : opportunity.accountId ? visitByTarget.get(`account:${opportunity.accountId}`) : undefined;
        return visit ? [{ id: opportunity.id, amount: Number(opportunity.amount), at: opportunity.closedAt ?? opportunity.updatedAt, visit }] : [];
      });
      const salesClusters = new Map<string, { id: string; areaName: string; lat: number; lng: number; count: number; value: number; occurredAt: Date }>();
      locatedSales.forEach((sale) => {
        const key = `${sale.visit.location}|${sale.visit.latitude!.toFixed(3)}|${sale.visit.longitude!.toFixed(3)}`;
        const current = salesClusters.get(key);
        salesClusters.set(key, current
          ? { ...current, count: current.count + 1, value: current.value + sale.amount, occurredAt: sale.at > current.occurredAt ? sale.at : current.occurredAt }
          : { id: sale.id, areaName: sale.visit.location, lat: sale.visit.latitude!, lng: sale.visit.longitude!, count: 1, value: sale.amount, occurredAt: sale.at });
      });
      const maxSale = Math.max(1, ...[...salesClusters.values()].map((cluster) => cluster.value));
      const salesHeatmap = [...salesClusters.values()].map((cluster) => ({
        ...cluster, intensity: cluster.value / maxSale,
      }));

      const territoryRows = territories.flatMap((territory, index) => {
        if (territory.boundaryPoints.length < 3) return [];
        const target = Number(territory.targets[0]?.monthlyTarget ?? 0);
        const achieved = Number(territory.targets[0]?.monthlyAchieved ?? 0);
        const centerLat = territory.boundaryPoints.reduce((sum, point) => sum + point.latitude, 0) / territory.boundaryPoints.length;
        const centerLng = territory.boundaryPoints.reduce((sum, point) => sum + point.longitude, 0) / territory.boundaryPoints.length;
        return [{
          id: territory.id, code: territory.code, name: territory.name, centerLat, centerLng,
          executivesCount: territory._count.members, targetAmount: target, achievedAmount: achieved,
          achievementPercentage: target > 0 ? Math.round(achieved / target * 1000) / 10 : 0,
          fillColor: territory.color || palette[index % palette.length], borderColor: territory.color || palette[index % palette.length],
          pathPoints: territory.boundaryPoints.map((point) => [point.latitude, point.longitude] as [number, number]),
        }];
      });

      const completedVisits = visits.filter((visit) => visit.status === "COMPLETED").length;
      const totalDistance = executives.reduce((sum, executive) => sum + executive.distanceKmToday, 0);
      const totalTarget = territoryRows.reduce((sum, territory) => sum + territory.targetAmount, 0);
      const totalAchieved = territoryRows.reduce((sum, territory) => sum + territory.achievedAmount, 0);
      const activities = [
        ...visits.map((visit) => ({ id: `visit:${visit.id}`, executiveId: visit.executiveMembershipId, executiveName: visit.executiveName, avatar: visit.executiveAvatar, action: visit.status === "COMPLETED" ? "Visit completed" : visit.status === "IN_PROGRESS" ? "Check-in success" : "Visit scheduled", location: visit.location, occurredAt: visit.checkOutTime ?? visit.checkInTime })),
        ...punches.map((punch) => ({ id: `punch:${punch.id}`, executiveId: punch.tenantMembershipId!, executiveName: memberships.find((member) => member.id === punch.tenantMembershipId)?.user.fullName ?? "Field executive", avatar: memberships.find((member) => member.id === punch.tenantMembershipId)?.user.avatarUrl ?? null, action: punch.type === "PUNCH_IN" ? "Punched in" : "Punched out", location: punch.locationName ?? "Location not reported", occurredAt: punch.timestamp })),
      ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, 20);

      return {
        startDate, endDate, timezone,
        summary: {
          totalExecutives: executives.length,
          activeExecutives: executives.filter((row) => row.status !== "Offline").length,
          onField: executives.filter((row) => row.status === "On Field").length,
          inTransit: executives.filter((row) => row.status === "In Transit").length,
          onBreak: 0,
          offline: executives.filter((row) => row.status === "Offline").length,
          visits: visits.length, completedVisits,
          visitMinutes: visits.reduce((sum, visit) => sum + visit.durationMinutes, 0),
          distanceKm: Math.round(totalDistance * 10) / 10,
          prospects: prospects.length,
          salesAmount: opportunities.reduce((sum, opportunity) => sum + Number(opportunity.amount), 0),
          locatedSalesAmount: locatedSales.reduce((sum, sale) => sum + sale.amount, 0),
          territories: territoryRows.length,
          territoryExecutives: territoryRows.reduce((sum, territory) => sum + territory.executivesCount, 0),
          territoryTarget: totalTarget, territoryAchieved: totalAchieved,
          territoryAchievement: totalTarget > 0 ? Math.round(totalAchieved / totalTarget * 1000) / 10 : 0,
        },
        executives, activities, prospects, visitHeatmap, salesHeatmap, territories: territoryRows,
      };
    });
  }

  async route(actor: RequestPrincipal, membershipId: string, input: unknown) {
    const query = routeQuery.parse(input);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.map.view");
      const tenantId = policy.scope.tenantId;
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? "Asia/Kolkata";
      const date = query.date ?? localDateKey(new Date(), timezone);
      const start = parseFollowUpSchedule(date, "12:00 AM", timezone);
      const end = parseFollowUpSchedule(nextDateKey(date), "12:00 AM", timezone);
      const member = await tx.tenantMembership.findFirst({
        where: { id: membershipId, tenantId, status: "ACTIVE" },
        select: { id: true, employeeCode: true, user: { select: { fullName: true, avatarUrl: true } } },
      });
      if (!member) throw new NotFoundException("Executive not found.");
      const [visits, punches] = await Promise.all([
        tx.leadVisit.findMany({
          where: { tenantId, executiveMembershipId: membershipId, checkInTime: { gte: start, lt: end }, status: { not: "CANCELLED" }, latitude: { not: null }, longitude: { not: null } },
          orderBy: { checkInTime: "asc" },
          select: { id: true, targetName: true, location: true, checkInTime: true, checkOutTime: true, durationMinutes: true, latitude: true, longitude: true, status: true },
        }),
        tx.punchLog.findMany({
          where: { tenantId, tenantMembershipId: membershipId, timestamp: { gte: start, lt: end } },
          orderBy: { timestamp: "asc" },
          select: { id: true, type: true, timestamp: true, latitude: true, longitude: true, locationName: true },
        }),
      ]);
      const points = [
        ...punches.map((punch) => ({ id: `punch:${punch.id}`, type: punch.type === "PUNCH_IN" ? "start" as const : "end" as const, title: punch.type === "PUNCH_IN" ? "Start location" : "End location", locationName: punch.locationName ?? "Attendance location", address: punch.locationName ?? "Location not reported", at: punch.timestamp, durationSpentMinutes: undefined, lat: punch.latitude, lng: punch.longitude, statusText: punch.type === "PUNCH_IN" ? "Punched in" : "Punched out" })),
        ...visits.map((visit) => ({ id: `visit:${visit.id}`, type: "visit" as const, title: "Field visit", locationName: visit.targetName, address: visit.location, at: visit.checkInTime, durationSpentMinutes: visit.durationMinutes, lat: visit.latitude!, lng: visit.longitude!, statusText: visit.status })),
      ].sort((a, b) => a.at.getTime() - b.at.getTime());
      let runningDistance = 0;
      const stops = points.map((point, index) => {
        if (index > 0) runningDistance += haversineKm({ latitude: points[index - 1].lat, longitude: points[index - 1].lng }, { latitude: point.lat, longitude: point.lng });
        return { ...point, stopNumber: index + 1, timestamp: point.at, distanceKm: Math.round(runningDistance * 10) / 10 };
      });
      const firstAt = points[0]?.at ?? null;
      const lastAt = points.at(-1)?.at ?? null;
      const minutes = firstAt && lastAt ? Math.max(0, Math.round((lastAt.getTime() - firstAt.getTime()) / 60_000)) : 0;
      return {
        executiveId: member.id, executiveCode: member.employeeCode ?? member.id,
        executiveName: member.user.fullName, executiveAvatar: member.user.avatarUrl,
        status: visits.some((visit) => visit.status === "IN_PROGRESS") ? "On Field" : "Route history",
        date, startTime: firstAt, endTime: lastAt, totalDurationText: formatDuration(minutes),
        totalDistanceKm: Math.round(runningDistance * 10) / 10,
        totalVisitsPlanned: visits.length, totalVisitsCompleted: visits.filter((visit) => visit.status === "COMPLETED").length,
        avgSpeedKmh: minutes > 0 ? Math.round((runningDistance / (minutes / 60)) * 10) / 10 : 0,
        stops, detailedRoadPath: points.map((point) => [point.lat, point.lng] as [number, number]),
      };
    });
  }
}
