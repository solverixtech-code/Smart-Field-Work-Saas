// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../common/api';
import SalesTeamsPage from './SalesTeamsPage';

vi.mock('../../common/api', () => ({
  api: { get: vi.fn() },
  extractErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
vi.mock('../../features/crm/CrmContext', () => ({ useDebouncedSearch: (value: string) => value }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.resetAllMocks();
});

describe('Sales teams management', () => {
  it('renders tenant team, leader image, targets, and performance returned by the API', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {
      items: [{
        id: 'team-west', name: 'West Team', code: 'WEST-01', region: 'Western Region',
        leaderName: 'Vikram Singh', leaderCode: 'TL-1002', leaderAvatarUrl: 'https://example.test/vikram.jpg',
        memberCount: 2, department: 'Sales', monthlyTarget: 100000, achievedAmount: 75000,
        achievedPercent: 75, dealsThisMonth: 1, status: 'Active',
      }],
      total: 1, page: 1, limit: 10, totalPages: 1, regions: ['Western Region'],
      summary: { totalTeams: 1, totalMembers: 2, activeTeams: 1, averageTeamSize: 2, currentDeals: 1, dealChangePercent: 0 },
      distribution: [{ region: 'Western Region', value: 1 }],
      topPerformers: [{ id: 'team-west', name: 'West Team', monthlyTarget: 100000, achievedAmount: 75000, achievedPercent: 75 }],
    } } as AxiosResponse);

    await act(async () => {
      root.render(<MemoryRouter><SalesTeamsPage /></MemoryRouter>);
      await Promise.resolve();
    });
    await act(async () => { await Promise.resolve(); });

    expect(api.get).toHaveBeenCalledWith('/tenant/crm/teams', expect.objectContaining({
      params: expect.objectContaining({ page: 1, limit: 10 }),
      signal: expect.any(AbortSignal),
    }));
    expect(host.textContent).toContain('West Team');
    expect(host.textContent).toContain('Vikram Singh');
    expect(host.textContent).toContain('Western Region');
    expect(host.textContent).toContain('₹1,00,000');
    expect(host.textContent).not.toContain('Mumbai North Team');
    expect(host.querySelector<HTMLImageElement>('img[alt="Vikram Singh"]')?.src).toBe('https://example.test/vikram.jpg');
    expect(host.querySelector<HTMLButtonElement>('button[title="View Team Details"]')).not.toBeNull();
  });
});
