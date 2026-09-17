import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAuthorizationBootstrap } from '../../store/slices/authorizationSlice';

export interface PermissionRouteProps {
  permission: string;
  children?: React.ReactNode;
}

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { platform, tenant, loaded, loading } = useAppSelector((state) => state.authorization);

  useEffect(() => {
    if (isAuthenticated && !loaded && !loading) {
      dispatch(fetchAuthorizationBootstrap());
    }
  }, [isAuthenticated, loaded, loading, dispatch]);

  const userRole = user?.role;
  const isSuperOrAdmin =
    userRole === 'SUPER_ADMIN' ||
    userRole === 'ADMIN' ||
    userRole === 'PLATFORM_SUPER_ADMIN' ||
    tenant?.roleCode === 'tenant_admin' ||
    platform?.roleCodes?.includes('PLATFORM_SUPER_ADMIN');

  const isPlatformScope = permission.startsWith('platform.');
  const permissionsList = isPlatformScope
    ? platform?.permissions
    : tenant?.permissions;

  const hasAccess =
    loaded && (isSuperOrAdmin || Boolean(permissionsList?.includes(permission)));

  if (loading || (!loaded && isAuthenticated)) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-6 text-center font-sans">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D1F3D] border-t-transparent mb-3" />
        <p className="text-xs font-semibold text-slate-500">Checking permissions...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-6 text-center font-sans">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0D1F3D]">Access Restricted</h2>
        <p className="mt-1 max-w-md text-xs text-slate-500">
          You do not have permission to view this resource (<span className="font-mono text-slate-700">{permission}</span>).
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2 font-bold text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}

export default PermissionRoute;
