// @vitest-environment jsdom
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosResponse } from 'axios';
import { api } from '../../common/api';
import EmployeeProfilePage from './EmployeeProfilePage';
import type { ExecutiveProfileData } from './executive-profile.types';

vi.mock('../../common/api', () => ({ api: { get: vi.fn() } }));
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

async function renderProfile(id: string) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[`/admin/employees/${id}`]}>
        <Routes>
          <Route path="/admin/employees/:id" element={<EmployeeProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await act(async () => {
    await Promise.resolve();
  });
}

describe('Executive profile', () => {
  it('opens the requested employee with their stored image and details', async () => {
    const response: ExecutiveProfileData = {
      id: 'member-vikram',
      employeeCode: 'FE-1002',
      displayName: 'Vikram Singh',
      avatarUrl: 'https://example.test/vikram.jpg',
      role: 'Field Executive',
      department: 'Sales',
      status: 'ACTIVE',
      email: 'vikram@example.test',
      mobile: '+919876543210',
      address: 'Andheri East, Mumbai',
      teamName: 'West Team',
      managerName: null,
      managerEmployeeCode: null,
      joinedAt: '2026-09-01T00:00:00.000Z',
      employmentType: null,
      overview: {
        totals: { leadsAssigned: 4, leadsConverted: 2, dealsWon: 1, revenue: 25000, conversionRate: 50 },
        changes: { leadsAssigned: 10, leadsConverted: 5, dealsWon: 0, revenue: 15 },
        target: null,
        trend: [],
        recentActivity: [],
      },
      performance: { period: 'Sep 2026', targets: [], trend: [], leadsBySource: [], visitCompletionRate: 0 },
      routeHistory: { totalDays: 0, totalVisits: 0, completedVisits: 0, totalDurationMinutes: 0, days: [], points: [] },
      attendance: { period: 'Sep 2026', summary: { present: 0, absent: 0, late: 0, halfDay: 0, workingDays: 0, percentage: 0, averageWorkMinutes: 0 }, days: [] },
      visits: { summary: { total: 0, completed: 0, scheduled: 0, cancelled: 0, productive: 0 }, items: [] },
      sales: { summary: { leadsAssigned: 0, leadsConverted: 0, dealsWon: 0, revenue: 0, pipelineValue: 0 }, trend: [], stages: [], wonDeals: [] },
      incentives: { available: false, message: 'No incentive payout records are available for this executive.' },
    };
    vi.mocked(api.get).mockResolvedValue({
      data: response,
    } as AxiosResponse);

    await renderProfile('member-vikram');

    expect(api.get).toHaveBeenCalledWith(
      '/tenant/crm/lead-assignees/member-vikram/profile',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(host.querySelector('h2')?.textContent).toBe('Vikram Singh');
    expect(host.querySelector<HTMLImageElement>('img[alt="Vikram Singh"]')?.src)
      .toBe('https://example.test/vikram.jpg');
    expect(host.textContent).toContain('vikram@example.test');
    expect(host.textContent).toContain('FE-1002');
    expect(host.textContent).toContain('Leads Assigned');
    expect(host.textContent).not.toContain('Rahul Verma');
    expect(host.textContent).not.toContain('member-vikram');

    for (const tab of ['Performance', 'Route History', 'Attendance', 'Visits', 'Sales', 'Incentives']) {
      const button = Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
        .find((item) => item.textContent === tab)!;
      await act(async () => button.click());
    }
    expect(host.textContent).toContain('No incentive payout records are available for this executive.');
  });

  it('shows an unavailable message instead of another employee for a missing profile', async () => {
    vi.mocked(api.get).mockRejectedValue({ isAxiosError: true, response: { status: 404 } });

    await renderProfile('missing-member');

    expect(host.querySelector('[role="alert"]')?.textContent)
      .toContain('This employee profile is unavailable.');
    expect(host.querySelector('h2')).toBeNull();
  });
});
