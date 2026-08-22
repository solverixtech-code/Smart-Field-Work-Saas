import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthTokens } from '@visiblo/shared';
import { getStoredAuthSession, saveAuthSession, clearAuthSession } from '../../common/authSession';

export interface AuthState {
  accessToken: string | null;
  user: AuthTokens['user'] | null;
  isAuthenticated: boolean;
}

const initialSession = getStoredAuthSession();

const initialState: AuthState = {
  accessToken: initialSession?.accessToken ?? null,
  user: initialSession?.user ?? null,
  isAuthenticated: Boolean(initialSession?.accessToken && initialSession?.user),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<Pick<AuthTokens, 'accessToken' | 'user'> & { refreshToken?: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      saveAuthSession({
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      });
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      clearAuthSession();
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
