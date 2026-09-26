import { BadRequestException, Injectable } from "@nestjs/common";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { JobService } from "../jobs/job.service";
import { CrmRepository } from "./crm.repository";
import { locationSampleBatch, type LocationSampleInput } from "./location-tracking-contract";

const SAMPLE_INTERVAL_SECONDS = 30;
const SAMPLE_DISTANCE_METERS = 10;
const MAX_ACCURACY_METERS = 100;
const MAX_SPEED_KMH = 180;

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
      const attendance = await tx.attendance.findFirst({
        where: {
          tenantId: policy.scope.tenantId,
          tenantMembershipId: policy.scope.membershipId,
          punchInTime: { not: null },
          punchOutTime: null,
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
      const ordered = [...batch.samples].sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt));
      const earliest = new Date(ordered[0].capturedAt);
      const latest = new Date(ordered.at(-1)!.capturedAt);
      if (latest > futureLimit) throw new BadRequestException("Location samples cannot be more than five minutes in the future.");

      const attendances = await tx.attendance.findMany({
        where: {
          tenantId: policy.scope.tenantId,
          tenantMembershipId: policy.scope.membershipId,
          punchInTime: { lte: latest },
          OR: [{ punchOutTime: null }, { punchOutTime: { gte: earliest } }],
        },
        select: { punchInTime: true, punchOutTime: true },
      });
      const insideAttendance = (capturedAt: Date) => attendances.some((attendance) =>
        attendance.punchInTime != null && capturedAt >= attendance.punchInTime && capturedAt <= (attendance.punchOutTime ?? futureLimit));

      const existing = await tx.executiveLocationSample.findMany({
        where: {
          tenantId: policy.scope.tenantId,
          membershipId: policy.scope.membershipId,
          clientSampleId: { in: ordered.map((sample) => sample.clientSampleId) },
        },
        select: { clientSampleId: true },
      });
      const duplicateIds = new Set(existing.map((sample) => sample.clientSampleId));
      const rejectedIds: string[] = [];
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
          const hours = Math.max((capturedAt.getTime() - previous.capturedAt.getTime()) / 3_600_000, 1 / 3600);
          const calculatedSpeed = distanceKm(previous, sample) / hours;
          if (calculatedSpeed > MAX_SPEED_KMH) {
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
