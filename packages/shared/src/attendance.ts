export type AttendanceLocationClassification =
  "OFFICE" | "ASSIGNED_VISIT" | "FIELD_REMOTE";
export type AttendanceDeviceState = "ACTIVE" | "PENDING" | "REVOKED";
export type AttendanceGeofenceResult =
  "INSIDE" | "OUTSIDE_ALLOWED" | "OUTSIDE_EXCEPTION";
export type AttendanceEvidenceState = "NOT_REQUIRED" | "CAPTURED";
export type AttendanceExceptionType =
  "OUTSIDE_GEOFENCE_PUNCH_OUT" | "CALENDAR_CONFLICT";
export type AttendanceMobilityMode = "INHERIT" | "OFFICE_ONLY" | "FIELD_REMOTE";

export interface AttendancePunchCommand {
  clientCommandId: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  selfieAssetId: string;
  installationId: string;
  label?: string;
  platform?: string;
  userAgent?: string;
  locationName?: string;
  remarks?: string;
}

export interface AttendanceDevice {
  id: string;
  installationId: string;
  label: string | null;
  platform: string | null;
  status: AttendanceDeviceState;
}

export interface AttendancePunchResult {
  message: string;
  duplicate: boolean;
  attendance: unknown;
  punchLog: unknown;
}

export interface AttendanceSelfContext {
  timezone: string;
  localDate: string;
  attendance: {
    id: string;
    status: string;
    punchInTime: string | null;
    punchOutTime: string | null;
  } | null;
  effectiveShift: { name: string; startTime: string; endTime: string } | null;
  device: AttendanceDevice | null;
  policy: {
    enforcementEnabled: boolean;
    maximumAccuracyMeters: number;
    maximumLocationAgeSeconds: number;
    requirePunchInSelfie: boolean;
    requirePunchOutSelfie: boolean;
  };
  mobilityMode: Exclude<AttendanceMobilityMode, "INHERIT">;
  permittedAction: "PUNCH_IN" | "PUNCH_OUT" | "COMPLETED";
}

export interface AttendanceMonitoringQuery {
  startDate: string;
  endDate: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface AttendancePunchRecord {
  id: string;
  membershipId: string;
  employeeName: string;
  employeeCode: string;
  avatarUrl: string | null;
  type: "PUNCH_IN" | "PUNCH_OUT";
  timestamp: string;
  capturedAt: string | null;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  locationName: string | null;
  locationKind: AttendanceLocationClassification | null;
  geofenceResult: AttendanceGeofenceResult | null;
  geofenceDistanceMeters: number | null;
  geofenceRadiusMeters: number | null;
  siteName: string | null;
  device: AttendanceDevice | null;
  evidenceStatus: AttendanceEvidenceState;
  hasSelfie: boolean;
  status: string | null;
  lateMinutes: number;
  exceptionCode: string | null;
  exceptions: Array<{
    id: string;
    type: AttendanceExceptionType;
    reviewedAt: string | null;
  }>;
}

export interface AttendanceSummary {
  onFieldPunched: number;
  officeCheckedIn: number;
  lateArrivals: number;
  absences: number;
  totalPunches: number;
  onTimePercent: number;
  onTimeChangePercent: number;
}

export interface AttendanceMonitoringResponse {
  timezone: string;
  range: { startDate: string; endDate: string };
  summary: AttendanceSummary;
  records: AttendancePunchRecord[];
  nextCursor: string | null;
}

export interface AttendanceSite {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface AttendancePolicy {
  enforcementEnabled: boolean;
  maximumAccuracyMeters: number;
  maximumLocationAgeSeconds: number;
  requirePunchInSelfie: boolean;
  requirePunchOutSelfie: boolean;
}

export interface AttendanceException {
  id: string;
  type: AttendanceExceptionType;
  reviewedAt: string | null;
  createdAt: string;
}
