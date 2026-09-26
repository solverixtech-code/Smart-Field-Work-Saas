import { useEffect, useState } from 'react';
import { api, extractErrorMessage } from '../../common/api';

export interface TeamCandidate {
  id: string;
  name: string;
  employeeCode: string | null;
  avatarUrl: string | null;
  designation: string;
  department?: string;
  teamId?: string | null;
  teamName?: string | null;
}

export interface TeamMember extends TeamCandidate {
  roleCode: string;
  status: 'Active' | 'Inactive';
  joinedAt: string;
  location: string;
  totalLeads: number;
  dealsCreated: number;
  dealsWon: number;
  dealsTarget: number;
  revenue: number;
  target: number;
  achievementPercent: number;
  winRate: number;
  averageDeal: number;
}

export interface TeamTarget {
  id: string;
  title: string;
  metric: string;
  targetValue: number;
  achieved: number;
  percent: number;
  thresholdPct: number;
  status: 'Achieved' | 'On Track' | 'Behind';
}

export interface TeamWorkspace {
  period: string;
  team: {
    id: string; name: string; code: string; description: string | null; department: string;
    region: string | null; teamType: string; dealAssignment: string; visibility: string;
    status: 'Active' | 'Inactive'; createdAt: string; updatedAt: string; leaderMembershipId: string | null;
  };
  leader: { id: string; name: string; employeeCode: string | null; avatarUrl: string | null } | null;
  manager: { id: string; name: string; employeeCode: string | null; designation: string; avatarUrl: string | null } | null;
  members: TeamMember[];
  candidates: TeamCandidate[];
  targets: TeamTarget[];
  summary: {
    totalMembers: number; activeMembers: number; inactiveMembers: number; newThisMonth: number;
    totalLeads: number; dealsCreated: number; dealsWon: number; revenue: number; revenueTarget: number;
    achievementPercent: number; visitsCompleted: number; demosCompleted: number;
  };
  salesTrend: Array<{ date: string; sales: number; revenue: number; deals: number; target: number }>;
  sourceRevenue: Array<{ name: string; value: number }>;
  leadSources: Array<{ name: string; count: number }>;
  dealFunnel?: Array<{ stage: string; count: number; pct: string; color: string }>;
}

export interface TeamOptions {
  candidates: TeamCandidate[];
  regions: Array<{ id: string; name: string }>;
}

export function useTeamWorkspace(teamId: string | undefined, period?: string) {
  const [data, setData] = useState<TeamWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!teamId) { setLoading(false); setError('Team not found.'); return; }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.get<TeamWorkspace>(`/tenant/crm/teams/${teamId}/workspace`, { signal: controller.signal, params: { period } })
      .then(({ data: response }) => {
        setData(response);
        try {
          sessionStorage.setItem(`visiblo_team_name_${response.team.id}`, response.team.name);
          window.dispatchEvent(new CustomEvent('visiblo:team-name-updated'));
        } catch { /* storage is optional */ }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load team details.'));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [teamId, period, version]);
  return { data, loading, error, refresh: () => setVersion((current) => current + 1) };
}

export const teamApi = {
  options: () => api.get<TeamOptions>('/tenant/crm/teams/options').then(({ data }) => data),
  create: (payload: Record<string, unknown>) => api.post<{ id: string }>('/tenant/crm/teams', payload).then(({ data }) => data),
  update: (teamId: string, payload: Record<string, unknown>) => api.patch(`/tenant/crm/teams/${teamId}`, payload),
  assignLeader: (teamId: string, membershipId: string | null) => api.put(`/tenant/crm/teams/${teamId}/leader`, { membershipId }),
  assignMembers: (teamId: string, membershipIds: string[], designation?: string) => api.post(`/tenant/crm/teams/${teamId}/members`, { membershipIds, designation }),
  removeMember: (teamId: string, membershipId: string) => api.delete(`/tenant/crm/teams/${teamId}/members/${membershipId}`),
};
