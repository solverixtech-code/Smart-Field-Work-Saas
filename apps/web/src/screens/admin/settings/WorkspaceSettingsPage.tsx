import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useRuntimeBootstrap } from '../../../features/runtime/context/RuntimeBootstrapContext';
import { workspaceSettingsService, WorkspaceSettings } from '../../../features/platform/tenants/services/workspace-settings.service';
import {
  Building2,
  Globe,
  Sliders,
  Shield,
  Lock,
  MapPin,
  Check,
  Languages,
  Banknote,
  Settings,
  Plug,
  Copy,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

// ─── Disabled Read-Only Toggle Switch ───
function DisabledToggleSwitch({ checked, label, description }: { checked: boolean | null; label: string; description?: string }) {
  const isValueKnown = checked !== null;
  const isChecked = Boolean(checked);

  return (
    <div className="flex items-center justify-between opacity-70">
      <div>
        <span className="font-extrabold text-[#0D1F3D] text-xs">{label}</span>
        {description && <p className="text-[10px] text-slate-500 font-medium">{description}</p>}
        {!isValueKnown && <p className="text-[9px] text-amber-600 font-semibold mt-0.5">Not Configured / Pending API Exposure</p>}
      </div>
      <div
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          isChecked ? 'bg-indigo-400' : 'bg-slate-300'
        }`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${isChecked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

interface TabProps {
  settings: WorkspaceSettings;
}

// ─── Api Exposure Callout Banner ───
function ApiExposureNotice({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="rounded-sm border border-amber-200 bg-amber-50/60 p-4 space-y-1">
      <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
        <Lock className="h-4 w-4 text-amber-600 shrink-0" />
        <span>{title || 'Read-Only Workspace Configuration (WORKSPACE_SETTINGS_MUTATION_BLOCKED_BY_API_EXPOSURE)'}</span>
      </div>
      <p className="text-xs text-amber-900 font-medium leading-relaxed">
        {message || 'Settings displayed on this page are authoritatively issued by server runtime bootstrap (/tenant/runtime/bootstrap). Client-side modification is currently disabled because backend mutation endpoints are not exposed in the frozen API contract.'}
      </p>
    </div>
  );
}

// ─── Tab: Workspace Profile ───
function ProfileTab({ settings }: TabProps) {
  const p = settings.profile;

  return (
    <div className="space-y-6">
      <ApiExposureNotice />

      {/* Card 1: Company Information */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Information</h3>
            <p className="text-[11px] text-slate-500 font-medium">Authoritative tenant information from runtime bootstrap.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Logo Card */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-slate-100 rounded-sm bg-slate-50/50 space-y-3">
            <div className="flex h-24 w-full items-center justify-center rounded-sm bg-white border border-slate-200 p-2 shadow-xs">
              <div className="text-center">
                <p className="font-extrabold text-[#0D1F3D] text-sm tracking-tight">{p.companyName || 'WORKSPACE'}</p>
                <p className="text-[9px] font-bold text-slate-500 tracking-wider">TENANT</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-sm border border-slate-200 cursor-not-allowed">
              Logo Upload Pending API Exposure
            </span>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name" value={p.companyName || 'Not Configured'} disabled readOnly />
            <Input label="Industry" value={p.industry || 'Not Configured'} disabled readOnly />
            <div>
              <label className="text-xs font-semibold text-[#0B2E6B] block mb-1.5">Tenant Workspace Code</label>
              <div className="flex rounded-sm border border-slate-200 bg-slate-100 overflow-hidden h-10">
                <input type="text" value={p.tenantCode} disabled readOnly className="flex-1 px-3 text-xs font-mono font-bold text-slate-700 bg-slate-100 cursor-not-allowed focus:outline-none" />
              </div>
            </div>
            <Input label="Website" value={p.website || 'Not Configured / Pending API Exposure'} disabled readOnly />
            <Input label="Primary Contact Email" value={p.primaryEmail || 'Not Configured / Pending API Exposure'} disabled readOnly />
            <Input label="Primary Contact Phone" value={p.primaryPhone || 'Not Configured / Pending API Exposure'} disabled readOnly />
          </div>
        </div>
      </div>

      {/* Row 2: Branding & Workspace Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branding */}
        <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Branding & Visuals</h3>
              <p className="text-[10px] text-slate-500 font-medium">Custom branding colors are pending backend API exposure.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Primary Color" value={p.primaryColor || 'Not Configured'} disabled readOnly />
              <Input label="Secondary Color" value={p.secondaryColor || 'Not Configured'} disabled readOnly />
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <DisabledToggleSwitch
              checked={p.logoInLogin}
              label="Logo in Login"
              description="Login logo customization is pending backend API exposure"
            />
          </div>
        </div>

        {/* Workspace Identity */}
        <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Workspace Identity</h3>
              <p className="text-[10px] text-slate-500 font-medium">Server-issued runtime identification parameters.</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1 min-w-0 flex-1 pr-3">
                <span className="text-xs font-semibold text-slate-500 block">Configuration Version</span>
                <span
                  title={p.configVersion}
                  className="font-mono font-bold text-[#0D1F3D] text-xs inline-block max-w-[220px] sm:max-w-[280px] truncate bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm"
                >
                  {p.configVersion}
                </span>
              </div>
              <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Active Bootstrap
              </span>
            </div>

            <div className="border-b border-slate-100 pb-3 space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Bootstrap Generated At</span>
              <span className="font-extrabold text-[#0D1F3D] text-xs">{p.createdOn}</span>
            </div>

            <div className="pt-0.5">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Created By</span>
              <span className="font-bold text-slate-500 text-xs">{p.createdBy || 'Not Available / Pending API Exposure'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Address */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Registered Address</h3>
            <p className="text-[10px] text-slate-500 font-medium">Address fields are not configured in runtime bootstrap.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input label="Address Line 1" value="Not Configured / Pending API Exposure" disabled readOnly />
          </div>
          <Input label="City" value="Not Configured / Pending API Exposure" disabled readOnly />
          <Input label="State" value="Not Configured / Pending API Exposure" disabled readOnly />
          <Input label="Country" value="Not Configured / Pending API Exposure" disabled readOnly />
          <Input label="PIN Code" value="Not Configured / Pending API Exposure" disabled readOnly />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Localization ───
function LocalizationTab({ settings }: TabProps) {
  const loc = settings.localization;

  return (
    <div className="space-y-6">
      <ApiExposureNotice />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Languages className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Localization Settings</h3>
            <p className="text-[11px] text-slate-500 font-medium">Authoritative regional preferences issued by server runtime bootstrap.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Timezone" value={loc.timezone} disabled readOnly />
          <Input label="Date Format" value={loc.dateFormat} disabled readOnly />
          <Input label="Time Format" value={loc.timeFormat || 'Not Configured / Pending API Exposure'} disabled readOnly />
          <Input label="Primary Language" value={loc.language} disabled readOnly />
          <Input label="Week Start Day" value={loc.weekStart} disabled readOnly />
          <Input label="Number Format" value={loc.numberFormat || 'Not Configured / Pending API Exposure'} disabled readOnly />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Business & Financial ───
function BusinessFinancialTab({ settings }: TabProps) {
  const bf = settings.financial;

  return (
    <div className="space-y-6">
      <ApiExposureNotice />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Banknote className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Financial Settings</h3>
            <p className="text-[11px] text-slate-500 font-medium">Authoritative currency and financial defaults from server bootstrap.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Currency" value={bf.currency} disabled readOnly />
          <Input label="Financial Year Start" value={bf.fyStart} disabled readOnly />
          <Input label="GST / Tax ID" value={bf.gstNumber || 'Not Configured / Pending API Exposure'} disabled readOnly />
          <Input label="PAN Number" value={bf.panNumber || 'Not Configured / Pending API Exposure'} disabled readOnly />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Preferences ───
function PreferencesTab() {
  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Workspace Preferences Read-Only"
        message="General workspace preferences and user notification defaults are governed by server defaults. Tenant-level preference override mutation endpoints are not exposed in the current API contract."
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Workspace Preferences</h3>
            <p className="text-[11px] text-slate-500 font-medium">Read-only view of preference state.</p>
          </div>
        </div>

        <div className="space-y-3">
          <DisabledToggleSwitch checked={null} label="Email Notifications" description="Not configured in runtime bootstrap" />
          <DisabledToggleSwitch checked={null} label="Push Notifications" description="Not configured in runtime bootstrap" />
          <DisabledToggleSwitch checked={null} label="Compact Table Mode" description="Not configured in runtime bootstrap" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Policies & Security ───
function PoliciesSecurityTab() {
  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Security Policies Read-Only"
        message="Authentication security, password expiration, 2FA, and geofencing policies are authoritatively governed by the frozen Phase 0.9 Platform Security Engine. Custom per-tenant security mutations are not exposed via frontend HTTP endpoints."
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Security Policies</h3>
            <p className="text-[11px] text-slate-500 font-medium">Platform security engine status.</p>
          </div>
        </div>

        <div className="space-y-3">
          <DisabledToggleSwitch checked={null} label="Enforce Two-Factor Authentication" description="Managed by platform security policy" />
          <DisabledToggleSwitch checked={null} label="Geofence Attendance Check-in" description="Managed by field policy module" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Integrations ───
function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Integrations Catalog Read-Only"
        message="Integration credentials and connector settings are managed via backend service configurations. Integration mutation endpoints are not exposed in the current API contract."
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plug className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Integrations Catalog</h3>
            <p className="text-[11px] text-slate-500 font-medium">Platform connectors overview.</p>
          </div>
        </div>

        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 font-medium">
          Integrations catalog mutations and key management are pending backend API exposure.
        </div>
      </div>
    </div>
  );
}

// ─── Right Sidebar ───
function RightSidebar({ settings }: { settings?: WorkspaceSettings | null }) {
  const companyName = settings?.profile?.companyName || 'Tenant Workspace';

  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Workspace Summary */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Authoritative Bootstrap</h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Organization</span>
            <span className="font-extrabold text-[#0D1F3D] truncate max-w-[140px]" title={companyName}>{companyName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Bootstrap Status</span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Server Validated</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-slate-600 font-medium">Tenant ID</span>
            <span className="font-mono font-bold text-slate-800">{settings?.profile?.tenantCode || '—'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-slate-600 font-medium">Config Version</span>
            <span className="font-mono font-bold text-slate-800">{settings?.profile?.configVersion || 'v1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* Truthful Read-Only Banner */}
      <div className="rounded-sm border border-indigo-200 bg-indigo-50/40 p-5 space-y-3">
        <div className="flex items-start gap-2.5">
          <Lock className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold text-indigo-950">Read-Only Server Configuration</h4>
            <p className="text-[10px] text-indigo-900 font-medium mt-0.5">
              All settings are authoritatively managed by server runtime bootstrap (<code className="font-mono bg-indigo-100 px-1 py-0.5 rounded">/tenant/runtime/bootstrap</code>). Client-side mutations are disabled.
            </p>
          </div>
        </div>
        <ul className="space-y-1 text-xs text-indigo-900 font-semibold pt-1">
          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Server-composed Company Name & ID</li>
          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Server-composed Timezone & Currency</li>
          <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-amber-600" /> Mutations Pending API Exposure</li>
        </ul>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ───
export function WorkspaceSettingsPage() {
  const { bootstrap, loading, error: bootstrapError, reloadBootstrap } = useRuntimeBootstrap();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // React to authoritative runtime bootstrap context directly!
  // Re-maps automatically upon tenant switch (when principal.membershipId or configVersion changes).
  const settings = useMemo<WorkspaceSettings | null>(() => {
    if (!bootstrap) return null;
    return workspaceSettingsService.getWorkspaceSettingsFromBootstrap(bootstrap);
  }, [bootstrap]);

  const handleReset = async () => {
    await reloadBootstrap();
    toast.info('Refreshed settings from authoritative server bootstrap');
  };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'profile', label: 'Workspace Profile' },
    { id: 'localization', label: 'Localization' },
    { id: 'business-financial', label: 'Business & Financial' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'policies-security', label: 'Policies & Security' },
    { id: 'integrations', label: 'Integrations' },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans">
        <div className="inline-block animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
        <p className="text-xs font-semibold">Loading authoritative workspace settings from server bootstrap...</p>
      </div>
    );
  }

  if (bootstrapError || !settings) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center font-sans space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#0D1F3D]">Workspace Settings Unavailable</h2>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto">
            {bootstrapError || 'Failed to load authoritative workspace configuration.'}
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={handleReset}
          className="font-bold px-6 shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Retry Loading Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Admin & Settings</span>
            <span>›</span>
            <span className="font-extrabold text-[#0D1F3D]">Workspace Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight mt-1">Workspace Settings</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Authoritative server-issued configuration for tenant <strong className="text-slate-800">{settings.profile.companyName}</strong> ({settings.profile.tenantCode}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
            <Lock className="h-3.5 w-3.5 text-amber-600" /> Read-Only (Server Managed)
          </span>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 font-bold text-slate-700">
            <RotateCcw className="h-4 w-4 text-slate-400" /> Refresh Bootstrap
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-[#0D1F3D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'profile' && <ProfileTab settings={settings} />}
          {activeTab === 'localization' && <LocalizationTab settings={settings} />}
          {activeTab === 'business-financial' && <BusinessFinancialTab settings={settings} />}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'policies-security' && <PoliciesSecurityTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
        </div>

        <RightSidebar settings={settings} />
      </div>
    </div>
  );
}
