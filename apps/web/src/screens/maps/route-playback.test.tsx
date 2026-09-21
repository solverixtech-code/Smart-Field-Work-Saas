// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FieldDashboardData } from '../dashboard/field-dashboard.api';
import RoutePlaybackPage from './RoutePlaybackPage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const apiMock = vi.hoisted(() => ({ get: vi.fn(), checkIn: vi.fn(), complete: vi.fn() }));
vi.mock('../dashboard/field-dashboard.api', () => ({ fieldDashboardApi: apiMock }));
vi.mock('../../store', () => ({
  useAppSelector: (selector: (state: {
    authorization: { tenant: { roleCode: string; membershipId: string; permissions: string[] } };
    auth: { user: { fullName: string } };
  }) => unknown) => selector({
    authorization: { tenant: { roleCode: 'field_executive', membershipId: 'member-1', permissions: ['crm.visits.checkin'] } },
    auth: { user: { fullName: 'Vikram Singh' } },
  }),
}));
vi.mock('../../components/maps/InteractiveMap', () => ({
  InteractiveMap: ({ routeStops }: { routeStops: Array<{ id: string }> }) =>
    <div data-testid="route-map" data-stops={routeStops.map((stop) => stop.id).join(',')} />,
}));
vi.mock('../../components/ui/DatePicker', () => ({
  DatePicker: ({ value }: { value: string }) => <span data-testid="route-date">{value}</span>,
}));

const routeData: FieldDashboardData = {
  startDate: '2026-09-21', endDate: '2026-09-21', today: '2026-09-21', timezone: 'Asia/Kolkata',
  executive: { name: 'Vikram Singh', avatarUrl: null },
  summary: { visitCount: 1, completedVisits: 1, followUpsDue: 0, demos: 0, completedDemos: 0, target: null },
  territoryNames: [],
  visits: [{
    id: 'visit-1', leadId: 'lead-1', leadCode: 'LD-100', name: 'Assigned Store',
    scheduledAt: '2026-09-21T05:00:00Z', checkOutTime: '2026-09-21T06:00:00Z',
    location: 'Andheri East', latitude: 19.11, longitude: 72.86,
    purpose: 'Sales visit', status: 'COMPLETED', outcome: 'Met the owner', durationMinutes: 60,
  }],
  punches: [{
    id: 'punch-1', type: 'PUNCH_IN', timestamp: '2026-09-21T04:00:00Z',
    latitude: 19.10, longitude: 72.85, locationName: 'Depot',
  }],
  attendance: { punchInTime: '2026-09-21T04:00:00Z', punchOutTime: null, totalWorkMinutes: 0, shift: null },
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'test-token');
  apiMock.get.mockResolvedValue(routeData);
  apiMock.checkIn.mockResolvedValue(undefined);
  apiMock.complete.mockResolvedValue(undefined);
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

describe('field executive route playback', () => {
  it('renders assigned visits and mobile punch locations from the API', async () => {
    await act(async () => root.render(<MemoryRouter><RoutePlaybackPage /></MemoryRouter>));
    expect(apiMock.get).toHaveBeenCalledOnce();
    expect(host.textContent).toContain('Vikram Singh');
    expect(host.textContent).toContain('Assigned Store');
    expect(host.textContent).toContain('Attendance punch in');
    expect(host.querySelector('[data-testid="route-map"]')?.getAttribute('data-stops')).toBe('punch-1,visit-1');
    expect(host.textContent).not.toContain('Arjun Mehta');
    expect(host.querySelector('button[aria-label="Punch In"]')).toBeNull();
  });

  it('shows an honest empty route when no records exist', async () => {
    apiMock.get.mockResolvedValue({ ...routeData, visits: [], punches: [], summary: { ...routeData.summary, visitCount: 0, completedVisits: 0 } });
    await act(async () => root.render(<MemoryRouter><RoutePlaybackPage /></MemoryRouter>));
    expect(host.textContent).toContain('No geotagged visits or mobile attendance locations');
    expect(host.textContent).toContain('No route activities for this date.');
    expect(host.textContent).not.toContain('28.6 km');
  });

  it('retains visit check-in without offering desktop attendance punch-in', async () => {
    apiMock.get.mockResolvedValue({ ...routeData, visits: [{ ...routeData.visits[0], status: 'SCHEDULED' }],
      summary: { ...routeData.summary, completedVisits: 0 } });
    await act(async () => root.render(<MemoryRouter><RoutePlaybackPage /></MemoryRouter>));
    const checkIn = Array.from(host.querySelectorAll('button')).find((button) => button.textContent?.includes('Check in to visit'));
    expect(checkIn).toBeTruthy();
    await act(async () => checkIn?.click());
    expect(apiMock.checkIn).toHaveBeenCalledWith('visit-1');
    expect(host.querySelector('button[aria-label="Punch In"]')).toBeNull();
  });
});
