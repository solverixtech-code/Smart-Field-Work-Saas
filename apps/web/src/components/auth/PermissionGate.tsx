import React from 'react';
import { useAppSelector } from '../../store';

export function usePermission(permission: string): boolean {
  const { platform, tenant, loaded } = useAppSelector((state) => state.authorization);
  if (!loaded) return false;

  if (permission.startsWith('platform.')) {
    return Boolean(platform?.permissions?.includes(permission));
  }
  return Boolean(tenant?.permissions?.includes(permission));
}

export interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const hasAccess = usePermission(permission);
  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}

export default PermissionGate;
