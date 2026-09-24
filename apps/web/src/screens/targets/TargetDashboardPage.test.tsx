// @vitest-environment jsdom
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../common/api';
import TargetDashboardPage from './TargetDashboardPage';

vi.mock('../../common/api', () => ({ api: { get: vi.fn(), post: vi.fn() }, extractErrorMessage: (_error: unknown, fallback: string) => fallback }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.resetAllMocks(); });

describe('Target dashboard', () => {
  it('renders persisted team performance and real employee images returned by the API', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {
      period: '2026-09', comparePeriod: '2026-08',
      summary: { totalTarget: 100000, achieved: 75000, achievementPercent: 75, activeExecutives: 1, incentiveEarned: 0, incentivePaid: 0, changes: { totalTarget: 10, achieved: 20, achievementPercent: 5, activeExecutives: 0, incentiveEarned: 0, incentivePaid: 0 } },
      teams: [{ id: 'target-1', teamId: 'team-1', title: 'West revenue', thresholdPct: 80, teamName: 'West Team', branch: 'WEST', teamLeaderName: 'Vikram Singh', teamLeaderAvatar: 'https://example.test/vikram.jpg', targetAmount: 100000, achievedAmount: 75000, achievementPct: 75, executivesCount: 2, incentiveEarned: 0, status: 'At Risk' }],
      executives: [],
      topAchievers: [{ id: 'exec-1', name: 'Asha Rao', avatarUrl: 'https://example.test/asha.jpg', teamName: 'West Team', achievementPct: 110 }],
      statusDistribution: { 'On Track': 0, 'At Risk': 1, Behind: 0 }, options: { teams: [{ value: 'team-1', label: 'West Team (WEST)' }], executives: [{ value: 'exec-1', label: 'Asha Rao', avatar: 'https://example.test/asha.jpg' }] }, sourceAvailability: { incentives: false, collections: false },
    } } as AxiosResponse);
    await act(async () => { root.render(<MemoryRouter><TargetDashboardPage /></MemoryRouter>); await Promise.resolve(); });
    await act(async () => { await Promise.resolve(); });
    expect(api.get).toHaveBeenCalledWith('/tenant/crm/targets/dashboard', expect.objectContaining({ params: expect.objectContaining({ period: expect.stringMatching(/^\d{4}-\d{2}$/), comparePeriod: expect.stringMatching(/^\d{4}-\d{2}$/) }) }));
    expect(host.textContent).toContain('West Team');
    expect(host.textContent).toContain('Vikram Singh');
    expect(host.textContent).toContain('₹ 1,00,000');
    expect(host.textContent).toContain('Asha Rao');
    expect(host.querySelector<HTMLImageElement>('img[alt="Vikram Singh"]')?.src).toBe('https://example.test/vikram.jpg');
  });
});
