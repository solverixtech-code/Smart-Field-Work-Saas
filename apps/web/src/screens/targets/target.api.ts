import { api } from '../../common/api';

export const currentPeriod = () => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}`;
};
export const shiftPeriod = (period: string, offset: number) => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};
export const periodLabel = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));
};

export type TargetStatus = 'On Track' | 'At Risk' | 'Behind';
export type TargetMetric = 'sales_amount' | 'demos_count' | 'visits_count' | 'collections_amount';

export interface TargetOption {
  value: string;
  label: string;
  avatar?: string;
  sublabel?: string;
}

export interface TeamTargetSummary {
  id: string;
  teamId: string;
  title: string;
  thresholdPct: number;
  teamName: string;
  branch: string;
  teamLeaderName: string;
  teamLeaderAvatar: string | null;
  targetAmount: number;
  achievedAmount: number;
  achievementPct: number;
  executivesCount: number;
  incentiveEarned: number;
  status: TargetStatus;
}

export interface ExecutiveTargetSummary {
  id: string;
  executiveId: string;
  executiveName: string;
  executiveAvatar: string | null;
  role: string;
  teamId: string | null;
  teamName: string;
  salesTarget: number;
  salesAchieved: number;
  salesPct: number;
  demosTarget: number;
  demosAchieved: number;
  visitsTarget: number;
  visitsAchieved: number;
  incentiveEarned: number;
  status: TargetStatus;
}

export interface TargetDashboardResponse {
  period: string;
  comparePeriod: string;
  summary: {
    totalTarget: number;
    achieved: number;
    achievementPercent: number;
    activeExecutives: number;
    incentiveEarned: number;
    incentivePaid: number;
    changes: {
      totalTarget: number;
      achieved: number;
      achievementPercent: number;
      activeExecutives: number;
      incentiveEarned: number;
      incentivePaid: number;
    };
  };
  teams: TeamTargetSummary[];
  executives: ExecutiveTargetSummary[];
  topAchievers: Array<{ id: string; name: string; avatarUrl: string | null; teamName: string; achievementPct: number }>;
  statusDistribution: Record<TargetStatus, number>;
  options: { teams: TargetOption[]; executives: TargetOption[] };
  sourceAvailability: { incentives: boolean; collections: boolean };
}

export interface SetTargetInput {
  targetType: 'team' | 'individual';
  scopeId: string;
  title: string;
  period: string;
  metric: TargetMetric;
  targetValue: number;
  thresholdPct: number;
}

export const getTargetDashboard = (period: string, comparePeriod: string, signal?: AbortSignal) =>
  api.get<TargetDashboardResponse>('/tenant/crm/targets/dashboard', { params: { period, comparePeriod }, signal });

export const setSalesTarget = (input: SetTargetInput) => api.post('/tenant/crm/targets', input);

export interface IncentiveRuleItem {
  id: string;
  ruleName: string;
  ruleType: 'Achievement' | 'Performance' | 'Activity' | 'Ranking' | 'Retention';
  appliesTo: 'All Executives' | 'Field Executives' | 'Telecallers' | 'Sales Managers';
  metric: 'Total Sales (Amount)' | 'New Customers (Count)' | 'Total Visits (Count)' | 'Demos (Count)' | 'Collections (Amount)';
  payoutRate: number;
  payoutStructure: string;
  startDate: string;
  endDate: string;
  validityPeriod: string;
  status: 'Active' | 'Paused' | 'Inactive';
  revision: number;
}

export interface IncentiveRulesResponse {
  items: IncentiveRuleItem[];
  summary: { total: number; active: number; paused: number; inactive: number };
}

export interface IncentiveCalculationItem {
  id: string;
  membershipId: string;
  executiveId: string;
  executiveName: string;
  executiveAvatar: string | null;
  teamName: string;
  salesIncentive: number;
  demoIncentive: number;
  visitIncentive: number;
  bonusIncentive: number;
  totalIncentive: number;
  approvedAmount: number;
  payoutStatus: 'Approved' | 'Pending Approval' | 'Paid' | 'Rejected';
  monthPeriod: string;
}

export interface IncentivePayoutItem {
  id: string;
  payoutId: string;
  executiveName: string;
  executiveAvatar: string | null;
  bankAccountOrUpi: string;
  amount: number;
  payoutDate: string;
  paymentMode: string;
  status: 'Paid' | 'Processing' | 'Failed';
  referenceNo: string;
}

export interface IncentivesResponse {
  calculations: IncentiveCalculationItem[];
  payouts: IncentivePayoutItem[];
  summary: { total: number; approved: number; pending: number; paid: number; activeEarners: number; activeRules: number };
}

export interface IncentiveRuleInput {
  name: string;
  ruleType: IncentiveRuleItem['ruleType'];
  appliesTo: IncentiveRuleItem['appliesTo'];
  metric: IncentiveRuleItem['metric'];
  payoutRate: number;
  startDate: string;
  endDate: string;
}

export const getIncentiveRules = (params: { search?: string; status?: string; ruleType?: string }, signal?: AbortSignal) => api.get<IncentiveRulesResponse>('/tenant/crm/incentive-rules', { params, signal });
export const createIncentiveRule = (input: IncentiveRuleInput) => api.post('/tenant/crm/incentive-rules', input);
export const updateIncentiveRule = (id: string, input: IncentiveRuleInput) => api.patch(`/tenant/crm/incentive-rules/${id}`, input);
export const updateIncentiveRuleStatus = (id: string, status: 'ACTIVE' | 'PAUSED' | 'INACTIVE') => api.patch(`/tenant/crm/incentive-rules/${id}/status`, { status });
export const calculateIncentives = (period: string) => api.post('/tenant/crm/incentives/calculate', { period });
export const getIncentives = (period: string, params: { search?: string; executiveId?: string } = {}, signal?: AbortSignal) => api.get<IncentivesResponse>('/tenant/crm/incentives', { params: { period, ...params }, signal });
export const approveIncentives = (calculationIds: string[]) => api.post('/tenant/crm/incentives/approve', { calculationIds });
export const getTargetNavigationSummary = (signal?: AbortSignal) => api.get<{ teamCount: number; executiveCount: number; ruleCount: number; targetAchievement: number; incentiveEarned: number }>('/tenant/crm/targets/navigation-summary', { signal });
