import { api } from "../../common/api";
import type {
  AttendanceDevice,
  AttendanceMonitoringQuery,
  AttendanceMonitoringResponse,
  AttendancePunchCommand,
  AttendanceSelfContext,
} from "@visiblo/shared";
export type {
  AttendanceDevice,
  AttendanceMonitoringResponse,
  AttendancePunchRecord,
  AttendanceSelfContext,
  AttendanceSummary,
} from "@visiblo/shared";

export interface UploadIntent {
  id: string;
  upload: { url: string; headers: Record<string, string> };
}

export interface AttendanceAdminMembership {
  id: string;
  employeeCode: string | null;
  designation: string | null;
  user: { fullName: string | null; email: string; avatarUrl: string | null };
  tenantRole: { name: string; code: string } | null;
  attendanceOverride: {
    mobilityMode: "INHERIT" | "OFFICE_ONLY" | "FIELD_REMOTE";
  } | null;
}

export interface AttendanceAdminSite {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface AttendanceAdminPolicy {
  enforcementEnabled: boolean;
  maximumAccuracyMeters: number;
  maximumLocationAgeSeconds: number;
  requirePunchInSelfie: boolean;
  requirePunchOutSelfie: boolean;
}

export interface AttendanceHolidayRecord {
  id: string;
  date: string;
  name: string;
}

export interface AttendanceLeaveRecord {
  id: string;
  membershipId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  remarks: string | null;
  membership: {
    employeeCode: string | null;
    user: { fullName: string | null; email: string };
  };
}

export interface AttendanceAdminDevice extends AttendanceDevice {
  approvedAt: string | null;
  revokedAt: string | null;
  lastSeenAt: string;
  userAgent: string | null;
  membership: {
    employeeCode: string | null;
    user: { fullName: string | null; email: string };
  };
}

export interface AttendanceAdminException {
  id: string;
  type: "OUTSIDE_GEOFENCE_PUNCH_OUT" | "CALENDAR_CONFLICT";
  details: Record<string, unknown> | null;
  reviewedAt: string | null;
  createdAt: string;
  membership: {
    employeeCode: string | null;
    user: { fullName: string | null; email: string };
  };
  punchLog: {
    latitude: number;
    longitude: number;
    locationName: string | null;
    geofenceDistanceMeters: number | null;
  } | null;
}

export const attendanceApi = {
  monitoring: async (params: AttendanceMonitoringQuery) =>
    (
      await api.get<AttendanceMonitoringResponse>(
        "/attendance/admin/monitoring",
        { params },
      )
    ).data,
  selfiePreview: async (id: string) =>
    (
      await api.get<{ url: string; expiresInSeconds: number }>(
        `/attendance/admin/punches/${id}/selfie-preview`,
      )
    ).data,
  enrollDevice: async (body: {
    installationId: string;
    label?: string;
    platform?: string;
    userAgent?: string;
  }) =>
    (await api.post<AttendanceDevice>("/attendance/me/devices/enroll", body))
      .data,
  context: async (installationId: string) =>
    (
      await api.get<AttendanceSelfContext>("/attendance/me/context", {
        params: { installationId },
      })
    ).data,
  selfieIntent: async (body: {
    displayName: string;
    mimeType: string;
    expectedBytes: number;
    checksumSha256: string;
  }) =>
    (await api.post<UploadIntent>("/attendance/me/selfies/upload-intent", body))
      .data,
  completeSelfie: async (id: string) =>
    (await api.post(`/attendance/me/selfies/${id}/complete`, {})).data,
  punch: async (type: "PUNCH_IN" | "PUNCH_OUT", body: AttendancePunchCommand) =>
    (
      await api.post(
        `/attendance/me/${type === "PUNCH_IN" ? "punch-in" : "punch-out"}`,
        body,
      )
    ).data,
  admin: {
    sites: async () =>
      (await api.get<AttendanceAdminSite[]>("/attendance/admin/sites")).data,
    saveSite: async (body: Omit<AttendanceAdminSite, "id">, id?: string) =>
      id
        ? (
            await api.put<AttendanceAdminSite>(
              `/attendance/admin/sites/${id}`,
              body,
            )
          ).data
        : (await api.post<AttendanceAdminSite>("/attendance/admin/sites", body))
            .data,
    deleteSite: async (id: string) =>
      api.delete(`/attendance/admin/sites/${id}`),
    policy: async () =>
      (await api.get<AttendanceAdminPolicy | null>("/attendance/admin/policy"))
        .data,
    savePolicy: async (body: AttendanceAdminPolicy) =>
      (await api.put<AttendanceAdminPolicy>("/attendance/admin/policy", body))
        .data,
    memberships: async () =>
      (
        await api.get<AttendanceAdminMembership[]>(
          "/attendance/admin/memberships",
        )
      ).data,
    setOverride: async (
      membershipId: string,
      mobilityMode: "INHERIT" | "OFFICE_ONLY" | "FIELD_REMOTE",
    ) =>
      (
        await api.put(
          `/attendance/admin/memberships/${membershipId}/override`,
          { mobilityMode },
        )
      ).data,
    deleteOverride: async (membershipId: string) =>
      api.delete(`/attendance/admin/memberships/${membershipId}/override`),
    holidays: async () =>
      (await api.get<AttendanceHolidayRecord[]>("/attendance/admin/holidays"))
        .data,
    saveHoliday: async (body: { date: string; name: string }) =>
      (
        await api.post<AttendanceHolidayRecord>(
          "/attendance/admin/holidays",
          body,
        )
      ).data,
    deleteHoliday: async (id: string) =>
      api.delete(`/attendance/admin/holidays/${id}`),
    leaves: async () =>
      (await api.get<AttendanceLeaveRecord[]>("/attendance/admin/leaves")).data,
    saveLeave: async (
      body: {
        membershipId: string;
        leaveType: string;
        startDate: string;
        endDate: string;
        remarks?: string;
      },
      id?: string,
    ) =>
      id
        ? (
            await api.put<AttendanceLeaveRecord>(
              `/attendance/admin/leaves/${id}`,
              body,
            )
          ).data
        : (
            await api.post<AttendanceLeaveRecord>(
              "/attendance/admin/leaves",
              body,
            )
          ).data,
    deleteLeave: async (id: string) =>
      api.delete(`/attendance/admin/leaves/${id}`),
    devices: async () =>
      (await api.get<AttendanceAdminDevice[]>("/attendance/admin/devices"))
        .data,
    setDeviceStatus: async (id: string, status: "ACTIVE" | "REVOKED") =>
      (
        await api.patch<AttendanceAdminDevice>(
          `/attendance/admin/devices/${id}/status`,
          { status },
        )
      ).data,
    exceptions: async () =>
      (
        await api.get<AttendanceAdminException[]>(
          "/attendance/admin/exceptions",
        )
      ).data,
    reviewException: async (id: string) =>
      (await api.patch(`/attendance/admin/exceptions/${id}/review`, {})).data,
  },
};
