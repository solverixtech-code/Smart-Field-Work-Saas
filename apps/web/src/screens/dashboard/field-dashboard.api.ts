import { api } from '../../common/api';

export interface FieldDashboardVisit {
  id: string;
  leadId: string | null;
  leadCode: string;
  name: string;
  scheduledAt: string;
  checkOutTime: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  purpose: string;
  status: string;
  outcome: string | null;
  durationMinutes: number;
}

export interface FieldDashboardData {
  startDate: string;
  endDate: string;
  today: string;
  timezone: string;
  executive: { name: string; avatarUrl: string | null };
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
  punches: Array<{
    id: string;
    type: 'PUNCH_IN' | 'PUNCH_OUT';
    timestamp: string;
    latitude: number;
    longitude: number;
    locationName: string | null;
  }>;
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
};
