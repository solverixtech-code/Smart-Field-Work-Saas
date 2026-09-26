import { BadRequestException, Injectable } from "@nestjs/common";
import { z } from "zod";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { JobService } from "../jobs/job.service";
import { CrmRepository } from "./crm.repository";
import { locationSample, locationSampleBatch, type LocationSampleInput } from "./location-tracking-contract";

const SAMPLE_INTERVAL_SECONDS = 30;
const SAMPLE_DISTANCE_METERS = 10;
const MAX_ACCURACY_METERS = 100;
const MAX_SPEED_KMH = 180;

function localDateKey(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLng = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

@Injectable()
export class LocationTrackingService {
  constructor(private readonly repo: CrmRepository, private readonly jobs: JobService) {}

  async session(actor: RequestPrincipal) {
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require("crm.location.track");
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId: policy.scope.tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? "Asia/Kolkata";
      const attendance = await tx.attendance.findFirst({
        where: {
          tenantId: policy.scope.tenantId,
          tenantMembershipId: policy.scope.membershipId,
          punchInTime: { not: null },
          punchOutTime: null,
          date: new Date(`${localDateKey(new Date(), timezone)}T00:00:00Z`),
        },
        orderBy: { date: "desc" },
        select: { id: true, punchInTime: true, punchOutTime: true },
      });
      return {
        active: Boolean(attendance?.punchInTime),
        attendanceId: attendance?.id ?? null,
        startedAt: attendance?.punchInTime ?? null,
        endedAt: attendance?.punchOutTime ?? null,
        sampleIntervalSeconds: SAMPLE_INTERVAL_SECONDS,
        movementThresholdMeters: SAMPLE_DISTANCE_METERS,
        minimumIntervalSeconds: 5,
        maxBatchSize: 200,
      };
    });
  }

  async ingest(actor: RequestPrincipal, input: unknown) {
    const batch = locationSampleBatch.parse(input);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require("crm.location.track");
      const now = new Date();
      const futureLimit = new Date(now.getTime() + 5 * 60_000);
      const rejectedIds: string[] = [];
      const parsedSamples: LocationSampleInput[] = [];
      for (const raw of batch.samples) {
        const parsed = locationSample.safeParse(raw);
        if (parsed.success) parsedSamples.push(parsed.data);
        else {
          const id = raw && typeof raw === "object" && "clientSampleId" in raw
            ? z.string().min(1).max(200).safeParse(raw.clientSampleId)
            : null;
          if (!id?.success) throw new BadRequestException("Every location sample must include a client sample ID.");
          rejectedIds.push(id.data);
        }
      }
      const rejectedSet = new Set(rejectedIds);
      const duplicateIds = new Set<string>();
      const uniqueSamples = new Map<string, LocationSampleInput>();
      parsedSamples.forEach((sample) => {
        if (rejectedSet.has(sample.clientSampleId) || uniqueSamples.has(sample.clientSampleId)) duplicateIds.add(sample.clientSampleId);
        else uniqueSamples.set(sample.clientSampleId, sample);
      });
      const ordered = [...uniqueSamples.values()].sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt));
      if (!ordered.length) return {
        acceptedIds: [], duplicateIds: [...duplicateIds], rejectedIds,
        accepted: 0, duplicates: duplicateIds.size, rejected: rejectedIds.length, unusable: 0,
      };
      const earliest = new Date(ordered[0].capturedAt);
      const latest = new Date(ordered.at(-1)!.capturedAt);
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId: policy.scope.tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? "Asia/Kolkata";
      const attendances = await tx.attendance.findMany({
        where: {
          tenantId: policy.scope.tenantId,
          tenantMembershipId: policy.scope.membershipId,
          punchInTime: { lte: latest },
          OR: [{ punchOutTime: null }, { punchOutTime: { gte: earliest } }],
        },
        select: { date: true, punchInTime: true, punchOutTime: true },
      });
      const insideAttendance = (capturedAt: Date) => attendances.some((attendance) =>
        localDateKey(capturedAt, timezone) === attendance.date.toISOString().slice(0, 10)
        && attendance.punchInTime != null && capturedAt >= attendance.punchInTime && capturedAt <= (attendance.punchOutTime ?? futureLimit));

      const existing = await tx.executiveLocationSample.findMany({
        where: {
          tenantId: policy.scope.tenantId,
          membershipId: policy.scope.membershipId,
          clientSampleId: { in: ordered.map((sample) => sample.clientSampleId) },
        },
        select: { clientSampleId: true },
      });
      existing.forEach((sample) => duplicateIds.add(sample.clientSampleId));
      const candidates: LocationSampleInput[] = [];
      for (const sample of ordered) {
        if (duplicateIds.has(sample.clientSampleId)) continue;
        const capturedAt = new Date(sample.capturedAt);
        if (capturedAt > futureLimit || !insideAttendance(capturedAt)) rejectedIds.push(sample.clientSampleId);
        else candidates.push(sample);
      }

      let previous = await tx.executiveLocationSample.findFirst({
        where: { tenantId: policy.scope.tenantId, membershipId: policy.scope.membershipId, isUsable: true, capturedAt: { lt: earliest } },
        orderBy: { capturedAt: "desc" },
        select: { latitude: true, longitude: true, capturedAt: true },
      });
      const rows = candidates.map((sample) => {
        const capturedAt = new Date(sample.capturedAt);
        let isUsable = true;
        let qualityReason: string | null = null;
        if (sample.accuracyMeters != null && sample.accuracyMeters > MAX_ACCURACY_METERS) {
          isUsable = false;
          qualityReason = "LOW_ACCURACY";
        } else if (sample.speedKmh != null && sample.speedKmh > MAX_SPEED_KMH) {
          isUsable = false;
          qualityReason = "IMPOSSIBLE_SPEED";
        } else if (previous) {
          const movementKm = distanceKm(previous, sample);
          const hours = Math.max((capturedAt.getTime() - previous.capturedAt.getTime()) / 3_600_000, 1 / 3600);
          const calculatedSpeed = movementKm / hours;
          if (movementKm < 0.003) {
            isUsable = false;
            qualityReason = "STATIONARY_NOISE";
          } else if (calculatedSpeed > MAX_SPEED_KMH) {
            isUsable = false;
            qualityReason = "GPS_JUMP";
          }
        }
        if (isUsable) previous = { latitude: sample.latitude, longitude: sample.longitude, capturedAt };
        return {
          tenantId: policy.scope.tenantId,
          membershipId: policy.scope.membershipId,
          clientSampleId: sample.clientSampleId,
          capturedAt,
          latitude: sample.latitude,
          longitude: sample.longitude,
          accuracyMeters: sample.accuracyMeters ?? null,
          speedKmh: sample.speedKmh ?? null,
          headingDegrees: sample.headingDegrees ?? null,
          batteryPercentage: sample.batteryPercentage ?? null,
          source: sample.source,
          isUsable,
          qualityReason,
        };
      });
      if (rows.length) await tx.executiveLocationSample.createMany({ data: rows, skipDuplicates: true });

      const retention = await tx.tenantSubscription.findUnique({
        where: { tenantId: policy.scope.tenantId },
        select: { planVersion: { select: { limits: { where: { limitCode: "data_retention_days" }, take: 1, select: { integerValue: true, isUnlimited: true } } } } },
      });
      const limit = retention?.planVersion.limits[0];
      if (!limit?.isUnlimited) {
        const retentionDays = Math.max(1, limit?.integerValue ?? 90);
        const dayKey = now.toISOString().slice(0, 10);
        await this.jobs.enqueue(tx, "gps.retention-cleanup", { tenantId: policy.scope.tenantId, retentionDays }, `gps-retention:${dayKey}`);
      }

      return {
        acceptedIds: rows.map((row) => row.clientSampleId),
        duplicateIds: [...duplicateIds],
        rejectedIds,
        accepted: rows.length,
        duplicates: duplicateIds.size,
        rejected: rejectedIds.length,
        unusable: rows.filter((row) => !row.isUsable).length,
      };
    });
  }
}
