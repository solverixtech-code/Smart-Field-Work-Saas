import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Globe,
  DollarSign,
  Sliders,
  Shield,
  Zap,
  Lock,
  Clock,
  MapPin,
  Camera,
  Check,
  Info,
  Sparkles,
  FileText,
  Upload,
  Calendar,
  Save,
  ShieldAlert,
  Smartphone,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

export function WorkspaceSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Form States
  const [companyName, setCompanyName] = useState('Sunrise Healthcare Pvt Ltd');
  const [shortName, setShortName] = useState('Sunrise');
  const [website, setWebsite] = useState('https://sunrisehealthcare.com');
  const [email, setEmail] = useState('admin@sunrisehealthcare.com');
  const [phone, setPhone] = useState('9876543210');

  // Localization State
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour');

  // Security Policies State
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 mins');
  const [gpsRequired, setGpsRequired] = useState(true);
  const [photoRequired, setPhotoRequired] = useState(true);
  const [mockLocationDetection, setMockLocationDetection] = useState(true);
  const [geofenceRequired, setGeofenceRequired] = useState(true);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0D1F3D]">Workspace Settings</h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure tenant workspace profile, localization defaults, field security policies, and integrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="accent" size="sm" onClick={() => toast.success('Workspace settings saved successfully')} className="gap-2 font-bold shadow-xs">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Workspace Profile
          </button>
          <button
            type="button"
            onClick={() => setTab('localization')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'localization'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Localization
          </button>
          <button
            type="button"
            onClick={() => setTab('business-financial')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'business-financial'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Business & Financial
          </button>
          <button
            type="button"
            onClick={() => setTab('preferences')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Preferences
          </button>
          <button
            type="button"
            onClick={() => setTab('policies-security')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'policies-security'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Policies & Security
          </button>
          <button
            type="button"
            onClick={() => setTab('integrations')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'integrations'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Integrations
          </button>
        </div>
      </div>

      {/* TAB A: WORKSPACE PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">General Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Short Name *" value={shortName} onChange={(e) => setShortName(e.target.value)} />
              <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Primary Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Primary Contact Phone *" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {/* Platform Controlled Fields (Read-Only) */}
          <div className="rounded-sm border border-purple-100 bg-[#F4F0FF] p-6 shadow-xs space-y-3">
            <p className="font-extrabold text-purple-950 text-xs flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-purple-600" /> Platform-Controlled Identifiers (Read-Only)
            </p>
            <p className="text-[11px] text-purple-900 font-medium">
              These workspace parameters are managed by the Smart Field Work SaaS platform administrator.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white p-3 rounded-sm border border-purple-200">
                <span className="text-slate-400 text-[10px] block font-bold">Tenant Code</span>
                <span className="font-mono font-extrabold text-slate-800 text-sm">SRHC-TNT</span>
              </div>
              <div className="bg-white p-3 rounded-sm border border-purple-200">
                <span className="text-slate-400 text-[10px] block font-bold">Workspace ID</span>
                <span className="font-mono font-extrabold text-slate-800 text-sm">ws_srhc_8892</span>
              </div>
              <div className="bg-white p-3 rounded-sm border border-purple-200">
                <span className="text-slate-400 text-[10px] block font-bold">Configuration Version</span>
                <span className="font-mono font-extrabold text-slate-800 text-sm">v2.4.1-enterprise</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: LOCALIZATION */}
      {activeTab === 'localization' && (
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Regional & Format Preferences</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Timezone *" value={timezone} onChange={() => {}} searchable={true} options={[{ value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' }, { value: 'UTC', label: 'UTC (+0:00)' }]} />
              <Select label="Currency *" value={currency} onChange={() => {}} searchable={true} options={[{ value: 'INR', label: 'INR - Indian Rupee (₹)' }, { value: 'USD', label: 'USD - US Dollar ($)' }]} />
              <Select label="Date Format *" value={dateFormat} onChange={() => {}} searchable={true} options={[{ value: 'DD MMM YYYY', label: 'DD MMM YYYY (27 Aug 2026)' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-08-27)' }]} />
            </div>

            {/* Live Preview Box */}
            <div className="rounded-sm bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
              <p className="font-extrabold text-[#0D1F3D]">Live Formatting Preview</p>
              <div className="flex flex-wrap items-center gap-6 font-mono text-slate-800 font-bold">
                <span>Date & Time: <strong className="text-indigo-600">27 Aug 2026, 2:45 PM</strong></span>
                <span>Currency Amount: <strong className="text-emerald-600">₹1,25,000.00</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: BUSINESS & FINANCIAL */}
      {activeTab === 'business-financial' && (
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Business Entity & Tax Identifiers</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Legal Business Name *" defaultValue="Sunrise Healthcare Private Limited" />
              <Input label="GST / Tax ID *" defaultValue="27AAACS9988D1Z9" />
              <Input label="PAN Identifier *" defaultValue="AAACS9988D" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Tax Preference *" value="Tax Exclusive" onChange={() => {}} searchable={true} options={[{ value: 'Tax Exclusive', label: 'Tax Exclusive (Prices + GST)' }, { value: 'Tax Inclusive', label: 'Tax Inclusive' }]} />
              <Input label="Default Tax Rate (%) *" defaultValue="18" />
              <Input label="Payment Terms *" defaultValue="Net 30 Days" />
            </div>
          </div>
        </div>
      )}

      {/* TAB D: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Workspace Application Preferences</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Default Landing Page *" value="Executive Dashboard" onChange={() => {}} searchable={true} options={[{ value: 'Executive Dashboard', label: 'Executive Dashboard' }, { value: 'All Leads', label: 'All Leads' }]} />
              <Select label="Default List Density *" value="Compact (25 rows)" onChange={() => {}} searchable={true} options={[{ value: 'Compact (25 rows)', label: 'Compact (25 rows)' }, { value: 'Standard (50 rows)', label: 'Standard (50 rows)' }]} />
              <Select label="Default Distance Unit *" value="Kilometers (km)" onChange={() => {}} searchable={true} options={[{ value: 'Kilometers (km)', label: 'Kilometers (km)' }, { value: 'Miles (mi)', label: 'Miles (mi)' }]} />
            </div>
          </div>
        </div>
      )}

      {/* TAB E: POLICIES & SECURITY */}
      {activeTab === 'policies-security' && (
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Authentication & Access Security</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={require2FA} onChange={setRequire2FA} label={<span className="font-extrabold text-[#0D1F3D]">Require Two-Factor Authentication (2FA)</span>} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-6">Enforce 2FA via SMS or Authenticator App for all users in this workspace.</p>
              </div>

              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-2">
                <Select label="Session Timeout *" value={sessionTimeout} onChange={() => {}} searchable={true} options={[{ value: '30 mins', label: '30 Minutes Inactivity' }, { value: '60 mins', label: '60 Minutes Inactivity' }]} />
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Field Operations Verification Rules</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={gpsRequired} onChange={setGpsRequired} label={<span className="font-extrabold text-[#0D1F3D]">GPS Location Required</span>} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-6">Mandatory GPS fix before field reps can check-in or submit visits.</p>
              </div>

              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={photoRequired} onChange={setPhotoRequired} label={<span className="font-extrabold text-[#0D1F3D]">Selfie Photo Punch-In</span>} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-6">Requires selfie camera verification on morning attendance punch-in.</p>
              </div>

              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={mockLocationDetection} onChange={setMockLocationDetection} label={<span className="font-extrabold text-[#0D1F3D]">Mock Location Detection</span>} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-6">Automatically flag and block fake GPS location spoofing apps.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB F: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="rounded-sm bg-blue-50 p-4 border border-blue-100 text-xs text-blue-950 font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Manage workspace API keys, communication channels, and accounting software integrations.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-sm border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                  💬
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0D1F3D]">WhatsApp Business API</h4>
                  <span className="text-[10px] text-emerald-700 font-bold">Connected</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Send automatic lead updates & visit reminders directly on WhatsApp.</p>
              <Button variant="outline" size="sm" onClick={() => toast.info('Managing WhatsApp settings')} className="w-full text-xs">Configure</Button>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                  📘
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0D1F3D]">Meta Lead Ads</h4>
                  <span className="text-[10px] text-emerald-700 font-bold">Connected</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Auto-sync Facebook & Instagram lead ad forms into the lead pipeline.</p>
              <Button variant="outline" size="sm" onClick={() => toast.info('Managing Meta settings')} className="w-full text-xs">Configure</Button>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-4 space-y-3 shadow-xs opacity-80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 font-bold">
                  📊
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0D1F3D]">SAP / Oracle ERP Sync</h4>
                  <span className="text-[10px] text-purple-700 font-extrabold">Upgrade Required</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Bi-directional enterprise ERP inventory & invoice synchronization.</p>
              <Button variant="outline" size="sm" disabled className="w-full text-xs opacity-50">Enterprise Plan Only</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
