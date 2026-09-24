// @vitest-environment jsdom
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../common/api';
import IncentiveRulesPage from './IncentiveRulesPage';
import IncentivesManagementPage from './IncentivesManagementPage';

vi.mock('../../common/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  extractErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(api.post).mockResolvedValue({ data: {} } as AxiosResponse);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.resetAllMocks();
});

describe('Dynamic incentive pages', () => {
  it('renders persisted rules and current payout totals returned by the API', async () => {
    vi.mocked(api.get).mockImplementation((url) => Promise.resolve({ data: url === '/tenant/crm/incentive-rules'
      ? { items: [{ id: 'rule-1', ruleName: 'Live sales rule', ruleType: 'Achievement', appliesTo: 'All Executives', metric: 'Total Sales (Amount)', payoutRate: 500, payoutStructure: '₹ 500 for every ₹ 10,000 achieved', startDate: '2026-09-01', endDate: '2026-09-30', validityPeriod: '01 Sep 2026 - 30 Sep 2026', status: 'Active', revision: 1 }], summary: { total: 1, active: 1, paused: 0, inactive: 0 } }
      : { calculations: [], payouts: [], summary: { total: 1500, approved: 0, pending: 1500, paid: 0, activeEarners: 1 } } } as AxiosResponse));

    await act(async () => { root.render(<MemoryRouter><IncentiveRulesPage /></MemoryRouter>); await Promise.resolve(); });
    await act(async () => { await Promise.resolve(); });

    expect(host.textContent).toContain('Live sales rule');
    expect(host.textContent).toContain('1 (100.0%)');
    expect(host.textContent).toContain('1,500');
  });

  it('calculates and renders live executive incentives for the selected period', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {
      calculations: [{ id: 'calculation-1', membershipId: 'member-1', executiveId: 'FE-1001', executiveName: 'Vikram Singh', executiveAvatar: null, teamName: 'West Team', salesIncentive: 5000, demoIncentive: 1000, visitIncentive: 500, bonusIncentive: 0, totalIncentive: 6500, approvedAmount: 0, payoutStatus: 'Pending Approval', monthPeriod: '2026-09' }],
      payouts: [], summary: { total: 6500, approved: 0, pending: 6500, paid: 0, activeEarners: 1 },
    } } as AxiosResponse);

    await act(async () => { root.render(<MemoryRouter initialEntries={['/admin/incentives']}><IncentivesManagementPage /></MemoryRouter>); await Promise.resolve(); });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    expect(api.post).toHaveBeenCalledWith('/tenant/crm/incentives/calculate', expect.objectContaining({ period: expect.stringMatching(/^\d{4}-\d{2}$/) }));
    expect(host.textContent).toContain('Vikram Singh');
    expect(host.textContent).toContain('6,500');
    expect(host.textContent).toContain('Pending Approval');
  });
});
