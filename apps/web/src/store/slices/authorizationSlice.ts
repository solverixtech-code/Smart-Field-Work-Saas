import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../common/api';

export interface AuthorizationBootstrapResponse {
  schemaVersion: number;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  session: {
    id: string;
  };
  platform: {
    roleCodes: string[];
    permissions: string[];
    permissionVersion: string | null;
  };
  tenant: {
    id: string;
    membershipId: string;
    roleCode: string | null;
    dataScope: string | null;
    permissions: string[];
    permissionVersion: string | null;
  } | null;
}

export interface AuthorizationState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
  platform: {
    roleCodes: string[];
    permissions: string[];
    permissionVersion: string | null;
  };
  tenant: {
    id: string | null;
    membershipId: string | null;
    roleCode: string | null;
    dataScope: string | null;
    permissions: string[];
    permissionVersion: string | null;
  } | null;
}

const initialState: AuthorizationState = {
  loading: false,
  loaded: false,
  error: null,
  platform: {
    roleCodes: [],
    permissions: [],
    permissionVersion: null,
  },
  tenant: null,
};

export const fetchAuthorizationBootstrap = createAsyncThunk(
  'authorization/fetchBootstrap',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<AuthorizationBootstrapResponse>('/auth/authorization');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch authorization state');
    }
  },
);

const authorizationSlice = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    clearAuthorization(state) {
      state.loading = false;
      state.loaded = false;
      state.error = null;
      state.platform = { roleCodes: [], permissions: [], permissionVersion: null };
      state.tenant = null;
    },
    setAuthorization(state, action: PayloadAction<AuthorizationBootstrapResponse>) {
      state.loaded = true;
      state.loading = false;
      state.error = null;
      state.platform = action.payload.platform;
      state.tenant = action.payload.tenant;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthorizationBootstrap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthorizationBootstrap.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = null;
        state.platform = action.payload.platform;
        state.tenant = action.payload.tenant;
      })
      .addCase(fetchAuthorizationBootstrap.rejected, (state, action) => {
        state.loading = false;
        state.loaded = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuthorization, setAuthorization } = authorizationSlice.actions;
export default authorizationSlice.reducer;
