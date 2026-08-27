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
  ArrowLeft,
  ChevronDown,
  Edit2,
  Users,
  Layers,
  FileText,
  ExternalLink,
  Lock,
  Plus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { tenantService } from '../../features/platform/tenants/services/tenant.service';
import { Tenant, TenantStatus } from '../../features/platform/tenants/types/platform.types';
import { PLATFORM_MODULES } from '../../features/platform/tenants/fixtures/platform.fixtures';
import { usePlatformPermissions } from '../../features/platform/tenants/hooks/usePlatformPermissions';

interface InternalNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  note: string;
}

export function TenantDetailsPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const { canSuspendTenant } = usePlatformPermissions();
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity_notes'>('overview');
  const [newNote, setNewNote] = useState('');

  // Internal Notes State (Platform Support Only)
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([
    { id: 'n1', author: 'Sahibjit Singh', role: 'Platform Super Admin', timestamp: '26 May 2026 · 02:30 PM', note: 'Customer requested assistance with Tally ERP integration. Onboarding scheduled for tomorrow.' },
    { id: 'n2', author: 'Ananya Roy', role: 'Platform Support', timestamp: '24 May 2026 · 11:15 AM', note: 'Added 10 extra user licenses following expansion to Pune sales zone.' },
  ]);

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

  const handleConfirmSuspend = async () => {
    const nextStatus: TenantStatus = tenant.tenantStatus === 'Suspended' ? 'Active' : 'Suspended';
    const updated = await tenantService.updateTenantStatus(tenant.id, nextStatus);
    setTenant(updated);
    toast.success(`Tenant ${tenant.companyName} status changed to ${nextStatus}`);
    setShowSuspendModal(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const noteObj: InternalNote = {
      id: `n_${Date.now()}`,
      author: 'Platform Admin',
      role: 'Platform Super Admin',
      timestamp: 'Just now',
      note: newNote,
    };
    setInternalNotes([noteObj, ...internalNotes]);
    setNewNote('');
    toast.success('Internal support note added');
  };

  return (
    <div className="space-y-5 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
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

        {/* Header Action Menu */}
        <div className="flex items-center gap-2 relative">
          <Button variant="outline" size="sm" onClick={() => navigate(`/platform/tenants/${tenant.id}/users`)} className="gap-2 font-bold text-slate-700">
            <Users className="h-4 w-4" /> Manage Users
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/platform/tenants/${tenant.id}/modules`)} className="gap-2 font-bold text-slate-700">
            <Layers className="h-4 w-4" /> Manage Modules
          </Button>

          {/* More Actions Dropdown Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="gap-1.5 font-bold text-slate-700"
            >
              More Actions <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </Button>

            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-sm border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setShowMoreActions(false); toast.info('Opening edit wizard'); }}
                  className="w-full px-3 py-2 text-left font-bold text-slate-700 hover:bg-slate-50 rounded-xs flex items-center gap-2"
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-400" /> Edit Tenant Details
                </button>
                <button
                  type="button"
                  onClick={() => { setShowMoreActions(false); navigate(`/platform/tenants/${tenant.id}/users`); }}
                  className="w-full px-3 py-2 text-left font-bold text-slate-700 hover:bg-slate-50 rounded-xs flex items-center gap-2"
                >
                  <Users className="h-3.5 w-3.5 text-slate-400" /> Manage Users & Seats
                </button>
                <button
                  type="button"
                  onClick={() => { setShowMoreActions(false); navigate(`/platform/tenants/${tenant.id}/modules`); }}
                  className="w-full px-3 py-2 text-left font-bold text-slate-700 hover:bg-slate-50 rounded-xs flex items-center gap-2"
                >
                  <Layers className="h-3.5 w-3.5 text-slate-400" /> Manage Entitlements
                </button>
                <button
                  type="button"
                  onClick={() => { setShowMoreActions(false); navigate('/platform/audit'); }}
                  className="w-full px-3 py-2 text-left font-bold text-slate-700 hover:bg-slate-50 rounded-xs flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> View Audit Trail
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => { setShowMoreActions(false); setShowSuspendModal(true); }}
                  className="w-full px-3 py-2 text-left font-bold text-rose-600 hover:bg-rose-50 rounded-xs flex items-center gap-2"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  {tenant.tenantStatus === 'Suspended' ? 'Reactivate Tenant' : 'Suspend Tenant'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'overview' ? 'border-[#0D1F3D] text-[#0D1F3D]' : 'border-transparent text-slate-500'
          }`}
        >
          Tenant Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('activity_notes')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'activity_notes' ? 'border-[#0D1F3D] text-[#0D1F3D]' : 'border-transparent text-slate-500'
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-purple-600" /> Activity Logs & Internal Notes ({internalNotes.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
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
      )}

      {activeTab === 'activity_notes' && (
        <div className="space-y-6 font-sans">
          {/* Internal Notes Callout */}
          <div className="rounded-sm bg-purple-50 p-4 border border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="text-purple-950 font-semibold">
                Internal Support Notes are visible <strong>ONLY</strong> to SFW Platform Personnel. They are strictly hidden from tenant users.
              </span>
            </div>
            <span className="font-extrabold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-sm">Platform Confidential</span>
          </div>

          {/* Add New Note Box */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-[#0D1F3D]">Add Platform Customer Support Note</h4>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type customer support or onboarding note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0D1F3D]"
              />
              <Button variant="accent" size="sm" onClick={handleAddNote} className="gap-2 font-bold shadow-xs">
                <Plus className="h-4 w-4" /> Add Note
              </Button>
            </div>
          </div>

          {/* Notes History List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#0D1F3D]">Internal Support Note History</h4>
            <div className="space-y-2.5">
              {internalNotes.map((note) => (
                <div key={note.id} className="rounded-sm border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0D1F3D]">{note.author}</span>
                      <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-sm border border-purple-100">{note.role}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">{note.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dangerous Suspend Tenant Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                {tenant.tenantStatus === 'Suspended' ? 'Reactivate Tenant Access' : 'Suspend Tenant Access'}
              </h3>
              <button type="button" onClick={() => setShowSuspendModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Are you sure you want to {tenant.tenantStatus === 'Suspended' ? 'reactivate' : 'suspend'} workspace access for <strong>{tenant.companyName}</strong>?
            </p>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setShowSuspendModal(false)}>Cancel</Button>
              <Button variant="accent" size="sm" onClick={handleConfirmSuspend} className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold">
                Confirm {tenant.tenantStatus === 'Suspended' ? 'Reactivation' : 'Suspension'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
