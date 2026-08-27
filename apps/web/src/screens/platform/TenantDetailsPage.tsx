import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  ChevronRight,
  Shield,
  CreditCard,
  UserCheck,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Button, Checkbox } from '../../components/ui';
import { tenantService } from '../../features/platform/tenants/services/tenant.service';
import { Tenant, TenantStatus, SubscriptionStatus } from '../../features/platform/tenants/types/platform.types';
import { PLATFORM_MODULES } from '../../features/platform/tenants/fixtures/platform.fixtures';
import { usePlatformPermissions } from '../../features/platform/tenants/hooks/usePlatformPermissions';

export function TenantDetailsPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const { canSuspendTenant, canManageSubscriptions } = usePlatformPermissions();

  useEffect(() => {
    if (tenantId) {
      tenantService.getTenantById(tenantId).then((t) => setTenant(t || null));
    }
  }, [tenantId]);

  if (!tenant) {
    return (
      <div className="p-8 text-center font-sans space-y-3">
        <p className="text-sm font-bold text-slate-500">Tenant not found or loading...</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/platform/tenants')}>← Back to Tenants</Button>
      </div>
    );
  }

  const handleToggleModule = (code: string) => {
    if (!tenant) return;
    const current = tenant.enabledModuleCodes;
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
    setTenant({ ...tenant, enabledModuleCodes: next });
    toast.success(`Module ${code} configuration updated`);
  };

  const handleUpdateStatus = async (status: TenantStatus) => {
    const updated = await tenantService.updateTenantStatus(tenant.id, status);
    setTenant(updated);
    toast.success(`Tenant status updated to ${status}`);
  };

  return (
    <div className="space-y-5 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <button onClick={() => navigate('/platform/tenants')} className="hover:text-[#0D1F3D] cursor-pointer">
              Tenants
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#0D1F3D] font-bold">{tenant.companyName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">{tenant.companyName}</h1>
          <p className="mt-0.5 text-xs font-mono text-indigo-700 font-bold">{tenant.domain}</p>
        </div>

        <div className="flex items-center gap-2">
          {canSuspendTenant && (
            <Button
              variant={tenant.tenantStatus === 'Suspended' ? 'accent' : 'outline'}
              size="sm"
              onClick={() => handleUpdateStatus(tenant.tenantStatus === 'Suspended' ? 'Active' : 'Suspended')}
              className="font-bold"
            >
              {tenant.tenantStatus === 'Suspended' ? 'Activate Tenant' : 'Suspend Tenant'}
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Tenant Status</span>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
            ● {tenant.tenantStatus}
          </span>
        </div>
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Subscription Status</span>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
            {tenant.subscriptionStatus}
          </span>
        </div>
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Pricing Plan</span>
          <span className="text-xs font-extrabold text-[#0D1F3D]">{tenant.planName}</span>
        </div>
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Monthly Recurring Revenue</span>
          <span className="text-xs font-mono font-extrabold text-emerald-700">₹{tenant.mrr.toLocaleString()} / mo</span>
        </div>
      </div>

      {/* Admin & Industry Details */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Primary Administrator Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-semibold">Full Name</span>
              <span className="font-bold text-[#0D1F3D]">{tenant.adminUser.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-semibold">Email</span>
              <span className="font-mono font-bold text-slate-800">{tenant.adminUser.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-semibold">Phone</span>
              <span className="font-mono font-bold text-slate-800">{tenant.adminUser.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Designation</span>
              <span className="font-bold text-[#0D1F3D]">{tenant.adminUser.designation}</span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Industry & Provisioning Configuration</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-semibold">Industry</span>
              <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-sm">{tenant.industryLabel}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-semibold">Provisioning Type</span>
              <span className="font-bold text-[#0D1F3D]">{tenant.provisioningType}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-semibold">User Licenses</span>
              <span className="font-mono font-bold text-[#0D1F3D]">{tenant.userLicensesCount} Reps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Created Date</span>
              <span className="font-bold text-slate-700">{tenant.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Toggles */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-[#0D1F3D]">Enabled Platform Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORM_MODULES.map((mod) => {
            const enabled = tenant.enabledModuleCodes.includes(mod.code);
            return (
              <div
                key={mod.id}
                onClick={() => handleToggleModule(mod.code)}
                className={`p-3 rounded-sm border flex items-center gap-2.5 cursor-pointer transition-all ${
                  enabled ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <Checkbox checked={enabled} onChange={() => {}} />
                <div>
                  <p className="text-xs font-bold text-[#0D1F3D]">{mod.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{mod.code}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
