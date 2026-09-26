import { AuthorizationBootstrapResponse } from '../store/slices/authorizationSlice';

/**
 * Authoritatively resolves post-login landing destination from server-issued authorization data.
 * Strictly evaluates platform.permissions and active tenant context from GET /auth/authorization.
 * Zero reliance on legacy User.role.
 */
export function resolvePostAuthDestination(
  authData: AuthorizationBootstrapResponse,
): string {
  // 1. If platform.permissions includes platform.dashboard.view ➔ route to Platform console
  if (authData?.platform?.permissions?.includes('platform.dashboard.view')) {
    return '/platform/dashboard';
  }

  // 2. If tenant context exists and role is Telecaller ➔ route to Telecaller Dashboard
  const roleCode = (authData?.tenant?.roleCode || '').toLowerCase();
  if (roleCode === 'telecaller') {
    return '/admin/dashboard/telecaller';
  }

  // 3. If tenant context exists and is populated ➔ route to Tenant Admin workspace
  if (authData?.tenant?.id) {
    return '/admin/dashboard';
  }

  // 4. Fallback for accounts without active platform or tenant assignments
  return '/admin/profile';
}
