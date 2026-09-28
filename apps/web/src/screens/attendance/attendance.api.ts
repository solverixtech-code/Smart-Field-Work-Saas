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
};
