import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { AuthTokensSchema } from '@visiblo/shared';
import store from '../store';
import { clearCredentials, setCredentials } from '../store/slices/authSlice';
import { clearStoredRefreshToken, getRefreshPayload, saveRefreshToken } from './authSession';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const payload = getRefreshPayload();
  if (!payload?.refreshToken) {
    store.dispatch(clearCredentials());
    return null;
  }

  try {
    // Send refresh request using raw axios (WITHOUT expired Bearer token header!)
    const response = await axios.post(`${baseURL}/auth/refresh`, payload, {
      withCredentials: true,
    });
    const tokens = AuthTokensSchema.parse(response.data);
    store.dispatch(
      setCredentials({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: tokens.user,
      }),
    );
    return tokens.accessToken;
  } catch (err) {
    clearStoredRefreshToken();
    store.dispatch(clearCredentials());
    return null;
  }
}

api.interceptors.request.use((config) => {
  const accessToken = store.getState().auth.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      url.includes('/auth/login') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    refreshPromise ??= performRefresh().finally(() => {
      refreshPromise = null;
    });

    const newAccessToken = await refreshPromise;

    if (newAccessToken) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (!err) return fallbackMessage;

  const axiosError = err as any;
  const data = axiosError?.response?.data;

  if (data) {
    // 1. Domain policy errors array e.g. { errors: [{ message: '...' }] }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const firstErr = data.errors[0];
      if (typeof firstErr === 'string' && firstErr.trim()) return firstErr;
      if (firstErr?.message && typeof firstErr.message === 'string') return firstErr.message;
    }

    // 2. Validation pipe errors array e.g. { message: ['description should not be empty'] }
    if (Array.isArray(data.message) && data.message.length > 0) {
      return data.message.join('. ');
    }

    // 3. Single string message e.g. { message: 'Plan publication policy validation failed' }
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    // 4. Detail string
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }

    // 5. Error string
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  }

  if (err instanceof Error && err.message) {
    if (!err.message.startsWith('Request failed with status code')) {
      return err.message;
    }
  }

  return fallbackMessage;
}

