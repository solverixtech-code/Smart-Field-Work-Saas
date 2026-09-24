// @vitest-environment jsdom
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../common/api';
import ProfilePage from './ProfilePage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const dispatch = vi.fn();
vi.mock('../../store', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) => selector({
    auth: {
      accessToken: 'access-token',
      user: {
        id: 'user-1',
        email: 'vikram@example.com',
        role: 'FIELD_EXECUTIVE',
        fullName: 'Vikram Singh',
        employeeCode: 'VIS-FE-001',
        image: null,
        permissions: [],
      },
    },
  }),
  useAppDispatch: () => dispatch,
}));
vi.mock('../../common/api', () => ({
  api: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
  extractErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const profile = {
  id: 'user-1',
  employeeCode: 'WEST-042',
  fullName: 'Vikram Singh',
  email: 'vikram@example.com',
  mobile: '+919876543210',
  dateOfBirth: '1992-06-18',
  officeAddress: 'Andheri East, Mumbai',
  designation: 'Field Executive',
  department: 'Sales',
  role: 'FIELD_EXECUTIVE',
  roleCode: 'field_executive',
  roleName: 'Field Executive',
  dataScope: 'SELF_AND_ASSIGNED_LEADS',
  teamName: 'West Team',
  avatarUrl: 'https://example.test/vikram.jpg',
  status: 'ACTIVE',
  joinedAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: '2026-09-24T05:00:00.000Z',
  lastPasswordChangeAt: '2026-09-01T05:00:00.000Z',
  twoFactorEnabled: true,
  emailVerified: true,
  username: 'vikram',
  timezone: 'Asia/Kolkata',
  loginIp: '127.0.0.1',
  permissionsCount: 8,
  teamAccess: 'West Team',
  lastPermissionUpdateAt: '2026-09-20T05:00:00.000Z',
  lastPermissionUpdatedBy: 'System Security',
  canEditDesignation: true,
  recentActivity: [{
    id: 'audit-1',
    action: 'LOGIN_SUCCESS',
    createdAt: '2026-09-24T05:00:00.000Z',
    ip: '127.0.0.1',
  }],
};

let host: HTMLDivElement;
let root: Root;
const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(api.get).mockResolvedValue({ data: profile } as never);
  vi.mocked(api.patch).mockResolvedValue({
    data: { ...profile, fullName: 'Vikram S. Singh' },
  } as never);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.clearAllMocks();
});

describe('ProfilePage', () => {
  it('renders authenticated profile, workspace, security, and activity data', async () => {
    await act(async () => root.render(
      <MemoryRouter initialEntries={['/admin/profile']}>
        <ProfilePage />
      </MemoryRouter>,
    ));
    await flush();

    expect(api.get).toHaveBeenCalledWith('/auth/me', expect.any(Object));
    expect(host.textContent).toContain('Vikram Singh');
    expect(host.textContent).toContain('+919876543210');
    expect(host.textContent).toContain('Andheri East, Mumbai');
    expect(host.textContent).toContain('8 permissions granted');
    expect(host.textContent).toContain('West Team');
    expect(host.textContent).toContain('Login Successful');
    expect(host.textContent).toContain('IP: 127.0.0.1');
    expect(host.textContent).not.toContain('Amit Sharma');
    expect(host.textContent).not.toContain('103.21.45.67');
  });

  it('persists edits through the current-user profile endpoint', async () => {
    await act(async () => root.render(
      <MemoryRouter initialEntries={['/admin/profile']}>
        <ProfilePage />
      </MemoryRouter>,
    ));
    await flush();

    const edit = Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('Edit Profile'))!;
    await act(async () => edit.click());

    const fullNameLabel = Array.from(host.querySelectorAll('label'))
      .find((label) => label.textContent === 'Full Name')!;
    const fullName = fullNameLabel.parentElement!.querySelector<HTMLInputElement>('input')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(fullName, 'Vikram S. Singh');
      fullName.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const save = Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('Save Changes'))!;
    await act(async () => save.click());
    await flush();

    expect(api.patch).toHaveBeenCalledWith('/auth/me', {
      fullName: 'Vikram S. Singh',
      mobile: '+919876543210',
      dateOfBirth: '1992-06-18',
      officeAddress: 'Andheri East, Mumbai',
      designation: 'Field Executive',
    });
    expect(host.textContent).toContain('Vikram S. Singh');
  });
});
