import { api } from '../../common/api';

export interface FieldDashboardVisit {
  id: string;
  leadId: string;
  leadCode: string;
  name: string;
  scheduledAt: string;
  checkOutTime: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  purpose: string;
  status: string;
}

export interface FieldDashboardData {
  startDate: string;
  endDate: string;
  today: string;
  timezone: string;
  summary: {
    visitCount: number;
    completedVisits: number;
    followUpsDue: number;
    demos: number;
    completedDemos: number;
    target: { amount: number; achieved: number; percentage: number } | null;
  };
  territoryNames: string[];
  visits: FieldDashboardVisit[];
  attendance: {
    punchInTime: string | null;
    punchOutTime: string | null;
    totalWorkMinutes: number;
    shift: { name: string; startTime: string; endTime: string } | null;
  };
}

export const fieldDashboardApi = {
  get: async (range: { startDate: string; endDate: string } | null, signal: AbortSignal): Promise<FieldDashboardData> =>
    (await api.get('/tenant/crm/field-dashboard', { params: range ?? undefined, signal })).data,
  checkIn: async (visitId: string): Promise<void> => {
    await api.patch(`/tenant/crm/field-dashboard/visits/${visitId}/check-in`);
  },
  complete: async (visitId: string, outcome: string): Promise<void> => {
    await api.patch(`/tenant/crm/field-dashboard/visits/${visitId}/complete`, { outcome });
  },
  punch: async (action: 'in' | 'out', coordinates: GeolocationCoordinates): Promise<void> => {
    await api.post(`/attendance/punch-${action}`, { latitude: coordinates.latitude, longitude: coordinates.longitude });
  },
};
