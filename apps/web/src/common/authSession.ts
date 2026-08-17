const REFRESH_TOKEN_KEY = 'visiblo_refresh_token';

let inMemoryRefreshToken: string | null = null;

function getStorage(type: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
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

function shouldPersistRefreshToken(): boolean {
  if (getStorage('local')?.getItem(REFRESH_TOKEN_KEY)) return true;
  if (getStorage('session')?.getItem(REFRESH_TOKEN_KEY)) return false;
  return true;
}

export function getStoredRefreshToken(): string | null {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  const session = getStorage('session')?.getItem(REFRESH_TOKEN_KEY);
  if (session) { inMemoryRefreshToken = session; return session; }
  const local = getStorage('local')?.getItem(REFRESH_TOKEN_KEY);
  if (local) { inMemoryRefreshToken = local; return local; }
  return null;
}

export function clearStoredRefreshToken(): void {
  inMemoryRefreshToken = null;
  getStorage('session')?.removeItem(REFRESH_TOKEN_KEY);
  getStorage('local')?.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshPayload(): { refreshToken: string } | undefined {
  const refreshToken = getStoredRefreshToken();
  return refreshToken ? { refreshToken } : undefined;
}
