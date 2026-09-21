// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FieldDashboardData } from './field-dashboard.api';
import ExecutiveDashboardPage from './ExecutiveDashboardPage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const apiMock = vi.hoisted(() => ({ get: vi.fn(), checkIn: vi.fn(), complete: vi.fn() }));
vi.mock('./field-dashboard.api', () => ({ fieldDashboardApi: apiMock }));
vi.mock('../../store', () => ({
  useAppSelector: (selector: (state: {
    authorization: { tenant: { roleCode: string; membershipId: string; permissions: string[] } };
    auth: { user: { fullName: string; role: string } };
  }) => unknown) => selector({
    authorization: { tenant: { roleCode: 'field_executive', membershipId: 'member-1', permissions: ['crm.visits.checkin'] } },
    auth: { user: { fullName: 'Vikram Singh', role: 'FIELD_EXECUTIVE' } },
  }),
}));
vi.mock('../../components/ui/DateRangePicker', () => ({
  DateRangePicker: () => <span>Today</span>,
}));
vi.mock('../../components/maps/InteractiveMap', () => ({
  InteractiveMap: ({ routeStops }: { routeStops: Array<{ id: string }> }) =>
    <div data-testid="route-preview" data-stops={routeStops.map((stop) => stop.id).join(',')} />,
}));

const dashboardData: FieldDashboardData = {
  startDate: '2026-09-21', endDate: '2026-09-21', today: '2026-09-21', timezone: 'Asia/Kolkata',
  executive: { name: 'Vikram Singh', avatarUrl: null },
  summary: { visitCount: 1, completedVisits: 0, followUpsDue: 2, demos: 1, completedDemos: 0, target: null },
  territoryNames: ['Andheri East'],
  visits: [{
    id: 'visit-1', leadId: 'lead-1', leadCode: 'LD-100', name: 'Assigned Store',
    scheduledAt: '2026-09-21T05:00:00Z', checkOutTime: null,
    location: 'Andheri East', latitude: 19.11, longitude: 72.86,
    purpose: 'Sales visit', status: 'SCHEDULED', outcome: null, durationMinutes: 0,
  }],
  punches: [],
  attendance: { punchInTime: null, punchOutTime: null, totalWorkMinutes: 0, shift: null },
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-token');
  apiMock.get.mockResolvedValue(dashboardData);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('field executive dashboard', () => {
  it('shows dashboard metrics and a map preview, with playback on a separate route', async () => {
    await act(async () => root.render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/admin/dashboard" element={<ExecutiveDashboardPage />} />
          <Route path="/admin/my-route" element={<div>Separate route view</div>} />
        </Routes>
      </MemoryRouter>,
    ));

    expect(apiMock.get).toHaveBeenCalledOnce();
    expect(host.textContent).toContain('Welcome back, Vikram');
    expect(host.textContent).toContain("Today's Visits");
    expect(host.textContent).toContain('Follow-ups Due');
    expect(host.textContent).toContain("Today's Beat Schedule");
    expect(host.querySelector('[data-testid="route-preview"]')?.getAttribute('data-stops')).toBe('visit-1');
    expect(host.textContent).not.toContain('Timeline Itinerary');
    expect(host.textContent).not.toContain('Punch In');

    const playbackLink = Array.from(host.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Route Playback');
    expect(playbackLink).toBeTruthy();
    await act(async () => playbackLink?.click());
    expect(host.textContent).toContain('Separate route view');
  });

  it('shows dashboard empty states without replacing the page with playback', async () => {
    apiMock.get.mockResolvedValue({ ...dashboardData, visits: [],
      summary: { ...dashboardData.summary, visitCount: 0, completedVisits: 0 } });
    await act(async () => root.render(<MemoryRouter><ExecutiveDashboardPage /></MemoryRouter>));

    expect(host.textContent).toContain('0 Visits');
    expect(host.textContent).toContain('No assigned visits for this date range.');
    expect(host.textContent).toContain('No geotagged visit locations for this range.');
    expect(host.textContent).not.toContain('Route Summary');
  });
});
