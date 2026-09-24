// @vitest-environment jsdom
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosResponse } from 'axios';
import { api } from '../../common/api';
import AllExecutivesPage from './AllExecutivesPage';

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

describe('Field executives directory', () => {
  it('renders tenant API records, live totals, and profile links in the existing directory UI', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {
      items: [{
        membershipId: 'member-vikram', employeeCode: 'FE-1002', name: 'Vikram Singh', email: 'vikram@example.test',
        mobile: '+919876543210', avatarUrl: 'https://example.test/vikram.jpg', team: 'West Team', region: 'Mumbai',
        status: 'On Field', visitsToday: 3, leadsToday: 1, joinedAt: '2026-09-05T00:00:00.000Z',
      }],
      total: 1, page: 1, limit: 10, totalPages: 1,
      summary: { total: 1, active: 0, onField: 1, onLeave: 0, inactive: 0, newThisMonth: 1 },
      regions: ['Mumbai'],
      topPerformers: [{ membershipId: 'member-vikram', name: 'Vikram Singh', avatarUrl: 'https://example.test/vikram.jpg', leads: 4 }],
    } } as AxiosResponse);

    await act(async () => {
      root.render(<MemoryRouter><AllExecutivesPage /></MemoryRouter>);
      await Promise.resolve();
    });
    await act(async () => { await Promise.resolve(); });

    expect(api.get).toHaveBeenCalledWith('/tenant/crm/executives', expect.objectContaining({
      params: expect.objectContaining({ page: 1, limit: 10 }),
      signal: expect.any(AbortSignal),
    }));
    expect(host.textContent).toContain('Vikram Singh');
    expect(host.textContent).toContain('FE-1002');
    expect(host.textContent).toContain('3 Visits');
    expect(host.textContent).toContain('1 Lead');
    expect(host.textContent).not.toContain('Rahul Verma');
    expect(host.textContent).not.toContain('member-vikram');
    expect(host.querySelector<HTMLAnchorElement>('a[href="/admin/executives/member-vikram"]')).not.toBeNull();
    expect(host.querySelector<HTMLImageElement>('img[alt="Vikram Singh"]')?.src).toBe('https://example.test/vikram.jpg');
  });
});
