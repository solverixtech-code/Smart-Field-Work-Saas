import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  HardDrive,
  Cpu,
  Edit,
  Info,
  Clock,
  Sparkles,
  FileText,
  Workflow,
  Zap,
  Mail,
  Smartphone,
  Globe,
  Webhook,
  Download,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Plan } from '../../types/plan.types';
import { formatLimit } from '../../utils/plan-pricing.utils';
import { Button } from '../../../../../../components/ui/Button';

export interface PlanLimitsTabProps {
  plan: Plan;
}

export function PlanLimitsTab({ plan }: PlanLimitsTabProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Banner matching screenshot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Limits & Quotas Inspection</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Resource limits and quotas included with this plan. Values represent per tenant unless specified.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate(`/platform/plans/create?planId=${plan.id}&step=limits`)}
          className="gap-2 font-bold shadow-xs shrink-0 bg-[#1D4ED8] hover:bg-blue-700 text-white border-none"
        >
          <Edit className="h-4 w-4" /> Edit Limits
        </Button>
      </div>

      {/* Main Grid: Left Column (2 Cols) + Right Column (1 Col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Users & Organization */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Users & Organization</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Users className="h-4 w-4 text-blue-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Minimum Seats</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">{plan.limits.minimumSeats || 20}</span>
                <span className="text-[10px] text-slate-600 font-medium">Users</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Users className="h-4 w-4 text-purple-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Default Seat Limit</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">{plan.limits.defaultSeatLimit || 150}</span>
                <span className="text-[10px] text-slate-600 font-medium">Users</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Users className="h-4 w-4 text-indigo-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Maximum Users</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">{formatLimit(plan.limits.maximumSeats || 150)}</span>
                <span className="text-[10px] text-slate-600 font-medium">Users</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Zap className="h-4 w-4 text-emerald-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Seat Increment</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">{plan.limits.seatIncrements || 10}</span>
                <span className="text-[10px] text-slate-600 font-medium">Users</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Clock className="h-4 w-4 text-amber-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Concurrent Sessions</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">{plan.limits.concurrentSessions || 50}</span>
                <span className="text-[10px] text-slate-600 font-medium">Sessions</span>
              </div>
            </div>
          </div>

          {/* Section 2: Storage & Data */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HardDrive className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Storage & Data</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <HardDrive className="h-4 w-4 text-blue-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Storage Included</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">{plan.limits.storageGb || 200} GB</span>
                <span className="text-[10px] text-slate-600 font-medium">Total Storage</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <HardDrive className="h-4 w-4 text-indigo-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Storage Increment</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">50 GB</span>
                <span className="text-[10px] text-slate-600 font-medium">Per Increment</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Clock className="h-4 w-4 text-purple-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Data Retention</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">1 Year</span>
                <span className="text-[10px] text-slate-600 font-medium">Retention Period</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Download className="h-4 w-4 text-emerald-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Full Data Export</span>
                <span className="text-lg font-extrabold text-emerald-600 block">Yes</span>
                <span className="text-[10px] text-slate-600 font-medium">Available</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <ShieldCheck className="h-4 w-4 text-cyan-500 mb-1.5" />
                <span className="text-[11px] font-semibold text-slate-500 block">Audit Log Retention</span>
                <span className="text-lg font-extrabold text-[#0D1F3D] block">1 Year</span>
                <span className="text-[10px] text-slate-600 font-medium">Retention Period</span>
              </div>
            </div>
          </div>

          {/* Section 3: Usage & Platform Limits */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Usage & Platform Limits</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Cpu className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">API Requests / Month</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">{formatLimit(plan.limits.apiRequestsPerMonth || 100000)}</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Workflow className="h-4 w-4 text-amber-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Active Workflows</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">{plan.limits.activeWorkflows || 25}</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <FileText className="h-4 w-4 text-purple-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Custom Forms</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">{plan.limits.customForms || 100}</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <FileText className="h-4 w-4 text-rose-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Report Exports / Month</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">{formatLimit(plan.limits.reportExportsPerMonth || 250)}</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <HardDrive className="h-4 w-4 text-indigo-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">File Upload Limit / File</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">50 MB</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Sparkles className="h-4 w-4 text-emerald-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">AI Credits / Month</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">{formatLimit(plan.limits.aiCreditsPerMonth || 5000)}</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Zap className="h-4 w-4 text-amber-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Automations / Month</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">{formatLimit(plan.limits.automationsPerMonth || 1000)}</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Mail className="h-4 w-4 text-purple-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Email Sends / Month</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">{formatLimit(plan.limits.emailSendsPerMonth || 10000)}</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Smartphone className="h-4 w-4 text-cyan-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Mobile Offline Data / Device</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">5 GB</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Globe className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Active Integrations</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">10</span>
              </div>

              <div className="p-3 rounded-sm border border-slate-100 bg-slate-50/50">
                <Webhook className="h-4 w-4 text-indigo-500 mb-1" />
                <span className="text-[11px] font-semibold text-slate-500 block">Webhooks</span>
                <span className="text-base font-extrabold text-[#0D1F3D] block">10</span>
              </div>
            </div>

            <div className="p-3 rounded-sm bg-blue-50/50 border border-blue-100 flex items-center gap-2 text-xs text-blue-700 font-medium">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <span>These limits apply to all tenants subscribed to this plan. Exceeding limits may require an upgrade.</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Card 1: Limits Summary */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0D1F3D] border-b border-slate-100 pb-3">Limits Summary</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Minimum Seats</span>
                <span className="font-extrabold text-[#0D1F3D]">{plan.limits.minimumSeats || 20}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Default Seat Limit</span>
                <span className="font-extrabold text-[#0D1F3D]">{plan.limits.defaultSeatLimit || 150}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Maximum Users</span>
                <span className="font-extrabold text-[#0D1F3D]">{formatLimit(plan.limits.maximumSeats || 150)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Storage Included</span>
                <span className="font-extrabold text-[#0D1F3D]">{plan.limits.storageGb || 200} GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">API Requests / Month</span>
                <span className="font-extrabold text-[#0D1F3D]">{formatLimit(plan.limits.apiRequestsPerMonth || 100000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Workflows</span>
                <span className="font-extrabold text-[#0D1F3D]">{plan.limits.activeWorkflows || 25}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Custom Forms</span>
                <span className="font-extrabold text-[#0D1F3D]">{plan.limits.customForms || 100}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">AI Credits / Month</span>
                <span className="font-extrabold text-[#0D1F3D]">{formatLimit(plan.limits.aiCreditsPerMonth || 5000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Full Data Export</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Yes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Audit Log Retention</span>
                <span className="font-extrabold text-[#0D1F3D]">1 Year</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate(`/platform/plans/${plan.id}/limits`)}
                className="justify-center font-bold text-slate-700"
              >
                View all limits in details
              </Button>
            </div>
          </div>

          {/* Card 2: Usage Guidance */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#0D1F3D]">Usage Guidance</h4>
            <div className="p-3.5 rounded-sm bg-emerald-50/60 border border-emerald-100 space-y-2 text-xs text-emerald-800 font-medium">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Great for mid-market teams</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Supports up to 150 active users</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Includes advanced automation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Best suited for 100K API requests / month</span>
              </div>
            </div>

            <div className="p-3 rounded-sm bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="h-4 w-4 text-amber-600" />
                <span>Need higher limits?</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Consider Enterprise plan or contact sales for custom allocations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
