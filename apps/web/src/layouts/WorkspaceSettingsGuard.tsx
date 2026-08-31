import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '../store';
import { Role } from '@visiblo/shared';
import { Button } from '../components/ui/Button';

export function WorkspaceSettingsGuard() {
  const user = useAppSelector((state) => state.auth.user);

  // Allow Super Admin and Tenant Admin to access Workspace Settings
  const isAuthorized =
    user && (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN);

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center font-sans space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#0D1F3D]">Access Restricted</h2>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            Tenant Owner or Tenant Admin privileges are required to access and modify workspace configuration settings.
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={() => window.history.back()}
          className="font-bold px-6 shadow-xs gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
