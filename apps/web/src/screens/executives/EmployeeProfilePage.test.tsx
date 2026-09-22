// @vitest-environment jsdom
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosResponse } from 'axios';
import { api } from '../../common/api';
import EmployeeProfilePage from './EmployeeProfilePage';

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
    vi.mocked(api.get).mockResolvedValue({
      data: {
        id: 'member-vikram',
        displayName: 'Vikram Singh',
        avatarUrl: 'https://example.test/vikram.jpg',
        role: 'Field Executive',
        department: 'Sales',
        status: 'ACTIVE',
        email: 'vikram@example.test',
        mobile: '+919876543210',
        teamName: 'West Team',
        managerName: null,
        joinedAt: '2026-09-01T00:00:00.000Z',
      },
    } as AxiosResponse);

    await renderProfile('member-vikram');

    expect(api.get).toHaveBeenCalledWith(
      '/tenant/crm/lead-assignees/member-vikram/profile',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(host.querySelector('h1')?.textContent).toBe('Vikram Singh');
    expect(host.querySelector<HTMLImageElement>('img[alt="Vikram Singh"]')?.src)
      .toBe('https://example.test/vikram.jpg');
    expect(host.textContent).toContain('vikram@example.test');
    expect(host.textContent).not.toContain('Rahul Verma');
    expect(host.textContent).not.toContain('member-vikram');
  });

  it('shows an unavailable message instead of another employee for a missing profile', async () => {
    vi.mocked(api.get).mockRejectedValue({ isAxiosError: true, response: { status: 404 } });

    await renderProfile('missing-member');

    expect(host.querySelector('[role="alert"]')?.textContent)
      .toContain('This employee profile is unavailable.');
    expect(host.querySelector('h1')).toBeNull();
  });
});
