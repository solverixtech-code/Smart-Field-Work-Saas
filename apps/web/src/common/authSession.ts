const REFRESH_TOKEN_KEY = 'visiblo_refresh_token';
const ACCESS_TOKEN_KEY = 'visiblo_access_token';
const AUTH_USER_KEY = 'visiblo_user';

let inMemoryRefreshToken: string | null = null;
let inMemoryAccessToken: string | null = null;
let inMemoryUser: any = null;

function getStorage(type: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function shouldPersistRefreshToken(): boolean {
  if (getStorage('local')?.getItem(REFRESH_TOKEN_KEY)) return true;
  if (getStorage('session')?.getItem(REFRESH_TOKEN_KEY)) return false;
  return true;
}

export function saveAuthSession(
  sessionData: { accessToken: string; refreshToken?: string; user: any },
  persist = shouldPersistRefreshToken(),
): void {
  inMemoryAccessToken = sessionData.accessToken;
  inMemoryUser = sessionData.user;
  if (sessionData.refreshToken) {
    inMemoryRefreshToken = sessionData.refreshToken;
  }

  const primary = getStorage(persist ? 'local' : 'session');
  const secondary = getStorage(persist ? 'session' : 'local');

  if (sessionData.refreshToken) {
    primary?.setItem(REFRESH_TOKEN_KEY, sessionData.refreshToken);
    secondary?.removeItem(REFRESH_TOKEN_KEY);
  }

  primary?.setItem(ACCESS_TOKEN_KEY, sessionData.accessToken);
  primary?.setItem(AUTH_USER_KEY, JSON.stringify(sessionData.user));
}

export function saveRefreshToken(
  refreshToken: string,
  persist = shouldPersistRefreshToken(),
): void {
  inMemoryRefreshToken = refreshToken;
  const primary = getStorage(persist ? 'local' : 'session');
  const secondary = getStorage(persist ? 'session' : 'local');
  primary?.setItem(REFRESH_TOKEN_KEY, refreshToken);
  secondary?.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  const session = getStorage('session')?.getItem(REFRESH_TOKEN_KEY);
  if (session) { inMemoryRefreshToken = session; return session; }
  const local = getStorage('local')?.getItem(REFRESH_TOKEN_KEY);
  if (local) { inMemoryRefreshToken = local; return local; }
  return null;
}

export function getStoredAuthSession(): { accessToken: string; user: any; refreshToken: string | null } | null {
  const refreshToken = getStoredRefreshToken();
  
  if (inMemoryAccessToken && inMemoryUser) {
    return { accessToken: inMemoryAccessToken, user: inMemoryUser, refreshToken };
  }

  const localAccess = getStorage('local')?.getItem(ACCESS_TOKEN_KEY) || getStorage('session')?.getItem(ACCESS_TOKEN_KEY);
  const localUserStr = getStorage('local')?.getItem(AUTH_USER_KEY) || getStorage('session')?.getItem(AUTH_USER_KEY);

  if (localAccess && localUserStr) {
    try {
      const user = JSON.parse(localUserStr);
      inMemoryAccessToken = localAccess;
      inMemoryUser = user;
      return { accessToken: localAccess, user, refreshToken };
    } catch {
      // ignore parse error
    }
  }

  return null;
}

export function clearStoredRefreshToken(): void {
  clearAuthSession();
}

export function clearAuthSession(): void {
  inMemoryRefreshToken = null;
  inMemoryAccessToken = null;
  inMemoryUser = null;
  getStorage('session')?.removeItem(REFRESH_TOKEN_KEY);
  getStorage('session')?.removeItem(ACCESS_TOKEN_KEY);
  getStorage('session')?.removeItem(AUTH_USER_KEY);
  getStorage('local')?.removeItem(REFRESH_TOKEN_KEY);
  getStorage('local')?.removeItem(ACCESS_TOKEN_KEY);
  getStorage('local')?.removeItem(AUTH_USER_KEY);
}

export function getRefreshPayload(): { refreshToken: string } | undefined {
  const refreshToken = getStoredRefreshToken();
  return refreshToken ? { refreshToken } : undefined;
}
