import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { runtimeService, RuntimeBootstrapDto } from '../services/runtime.service';
import store, { useAppDispatch, useAppSelector } from '../../../store';
import { api } from '../../../common/api';
import { setCredentials } from '../../../store/slices/authSlice';
import { clearAuthorization, fetchAuthorizationBootstrap } from '../../../store/slices/authorizationSlice';
import { toast } from 'sonner';

interface RuntimeBootstrapContextType {
  bootstrap: RuntimeBootstrapDto | null;
  loading: boolean;
  error: string | null;
  unsupportedSchema: boolean;
  effectiveModuleCodes: string[];
  effectivePermissions: string[];
  hasModule: (moduleCode: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isReadOnly: boolean;
  reloadBootstrap: () => Promise<void>;
  switchMembership: (membershipId: string) => Promise<void>;
}

const RuntimeBootstrapContext = createContext<RuntimeBootstrapContextType | undefined>(undefined);

export function RuntimeBootstrapProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const tenantAuth = useAppSelector((s) => s.authorization.tenant);

  const requestGeneration = useRef(0);
  const [bootstrap, setBootstrap] = useState<RuntimeBootstrapDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedSchema, setUnsupportedSchema] = useState(false);

  const reloadBootstrap = useCallback(async () => {
    if (!isAuthenticated || !tenantAuth?.id) {
      setBootstrap(null);
      return;
    }
    const generation = ++requestGeneration.current;
    const expectedTenant = tenantAuth.id;
    const expectedMembership = tenantAuth.membershipId;
    const current = () => {
      const selected = store.getState().authorization.tenant;
      return generation === requestGeneration.current && selected?.id === expectedTenant && selected.membershipId === expectedMembership;
    };
    setLoading(true);
    setBootstrap(null);
    setError(null);
    setUnsupportedSchema(false);
    try {
      const data = await runtimeService.getBootstrap();
      if (!current()) return;
      if (data.principal.tenantId !== expectedTenant || data.principal.membershipId !== expectedMembership) {
        setError('Workspace selection changed. Reload its settings.');
        return;
      }
      setBootstrap(data);
    } catch (err: any) {
      if (!current()) return;
      if (err.message?.includes('UNSUPPORTED_BOOTSTRAP_SCHEMA')) {
        setUnsupportedSchema(true);
        setError('Server returned an unsupported runtime bootstrap schema version.');
      } else if (err.response?.status === 403) {
        setError('Tenant subscription or membership access is blocked.');
      } else {
        setError(err.response?.data?.message || 'Failed to resolve runtime bootstrap.');
      }
    } finally {
      if (current()) setLoading(false);
    }
  }, [isAuthenticated, tenantAuth?.id, tenantAuth?.membershipId]);

  useEffect(() => {
    void reloadBootstrap();
    return () => { requestGeneration.current++; };
  }, [reloadBootstrap]);

  const switchMembership = async (membershipId: string) => {
    try {
      setLoading(true);
      // 1. Post to authoritative /auth/memberships/select
      const res = await api.post('/auth/memberships/select', { membershipId });
      const { accessToken, refreshToken, user } = res.data;

      // 2. Rotate credentials in client session
      dispatch(setCredentials({ accessToken, refreshToken, user }));

      // 3. Clear authorization state in Redux
      dispatch(clearAuthorization());

      // 4. Clear and invalidate all tenant-specific cached data
      runtimeService.invalidateTenantCache();

      // 4. Reload authorization and runtime bootstrap for the new membership
      await dispatch(fetchAuthorizationBootstrap()).unwrap();
      // The authorization-context effect reloads the newly selected membership.

      toast.success('Switched tenant workspace successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to switch tenant workspace');
    } finally {
      setLoading(false);
    }
  };

  const effectiveModuleCodes = bootstrap?.modules.map((m) => m.code) || [];
  const effectivePermissions = bootstrap?.permissions || [];

  const hasModule = (moduleCode: string): boolean => {
    return effectiveModuleCodes.includes(moduleCode);
  };

  const hasPermission = (permission: string): boolean => {
    return effectivePermissions.includes(permission);
  };

  const isReadOnly = bootstrap?.access.mode === 'READ_ONLY';

  return (
    <RuntimeBootstrapContext.Provider
      value={{
        bootstrap,
        loading,
        error,
        unsupportedSchema,
        effectiveModuleCodes,
        effectivePermissions,
        hasModule,
        hasPermission,
        isReadOnly,
        reloadBootstrap,
        switchMembership,
      }}
    >
      {children}
    </RuntimeBootstrapContext.Provider>
  );
}

export function useRuntimeBootstrap() {
  const context = useContext(RuntimeBootstrapContext);
  if (!context) {
    throw new Error('useRuntimeBootstrap must be used within a RuntimeBootstrapProvider');
  }
  return context;
}
