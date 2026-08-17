import { Navigate, Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '../store';
import { Role, getUserRoleLabel } from '@visiblo/shared';
import { Button } from '../components/ui';

export interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRole = user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-[#0B2E6B]">Access Restricted</h2>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Your role (<span className="font-bold text-[#0B2E6B]">{getUserRoleLabel(userRole)}</span>) does not have permission to view this dashboard page.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0B2E6B] shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
}
