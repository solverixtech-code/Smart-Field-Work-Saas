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
    saveRefreshToken(tokens.refreshToken);
    store.dispatch(
      setCredentials({ accessToken: tokens.accessToken, user: tokens.user }),
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
