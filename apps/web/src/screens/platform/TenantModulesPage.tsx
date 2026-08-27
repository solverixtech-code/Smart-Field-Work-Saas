import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Layers,
  ChevronLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Lock,
  ExternalLink,
  RefreshCw,
  Plus,
  Check,
  Briefcase,
  MapPin,
  FileText,
  CreditCard,
  Clock,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  BookOpen,
  Bell,
  CheckSquare,
  Image as ImageIcon,
  Key,
  Workflow,
  Box,
  Truck,
  DollarSign,
  FileSpreadsheet,
  Receipt,
  Mail,
  Smartphone,
  Calendar,
  Code,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';

interface ModuleItem {
  key: string;
  name: string;
  desc: string;
  category: string;
  tag: 'Included In Plan' | 'Industry Recommended' | 'Tenant Enabled' | 'Add-on' | 'Upgrade Required' | 'Not Available';
  enabled: boolean;
  requires?: string[];
  usageLimit?: string;
  price?: string;
  icon: React.ReactNode;
}

interface IntegrationItem {
  key: string;
  name: string;
  category: 'Communication' | 'Sales & Marketing' | 'Productivity' | 'Finance & ERP' | 'Technical';
  status: 'Not Configured' | 'Connected' | 'Attention Required' | 'Sync Error' | 'Disabled';
  enabled: boolean;
  lastSync?: string;
  account?: string;
  icon: React.ReactNode;
}

export function TenantModulesPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'core';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfigModule, setSelectedConfigModule] = useState<ModuleItem | null>(null);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Core Modules Data
  const [coreModules, setCoreModules] = useState<ModuleItem[]>([
    { key: 'crm', name: 'CRM & Leads', desc: 'Lead capture, pipeline stages, lead assignment & auto-routing.', category: 'Core', tag: 'Included In Plan', enabled: true, usageLimit: 'Unlimited Leads', icon: <Briefcase className="h-4 w-4 text-indigo-600" /> },
    { key: 'field_visits', name: 'Field Workforce & Visits', desc: 'Geofenced check-ins, route map playback, visit proof attachments.', category: 'Core', tag: 'Included In Plan', enabled: true, usageLimit: '50 Active Field Reps', icon: <MapPin className="h-4 w-4 text-emerald-600" /> },
    { key: 'attendance', name: 'Attendance & Time Tracking', desc: 'Selfie biometric check-in, late arrival penalty rules, muster roll.', category: 'Core', tag: 'Included In Plan', enabled: true, usageLimit: 'Unlimited Geo-Punches', icon: <Clock className="h-4 w-4 text-amber-600" /> },
    { key: 'forms', name: 'Forms & Surveys', desc: 'Build custom inspection forms, audit surveys & field data capture.', category: 'Core', tag: 'Included In Plan', enabled: true, usageLimit: '25 Active Forms', icon: <FileText className="h-4 w-4 text-purple-600" /> },
    { key: 'tasks', name: 'Tasks & Activities', desc: 'Create tasks, set due dates, assign executives and track progress.', category: 'Core', tag: 'Included In Plan', enabled: true, usageLimit: 'Unlimited Tasks', icon: <CheckSquare className="h-4 w-4 text-rose-600" /> },
    { key: 'reports', name: 'Reports & Analytics', desc: 'Real-time reports, executive performance dashboards & data exports.', category: 'Core', tag: 'Included In Plan', enabled: true, usageLimit: 'Standard Reports', icon: <BarChart3 className="h-4 w-4 text-blue-600" /> },
  ]);

  // Advanced Modules Data
  const [advancedModules, setAdvancedModules] = useState<ModuleItem[]>([
    { key: 'gps_tracking', name: 'GPS & Live Location Tracking', desc: 'Real-time live rep location streaming, route playback & geofence alerts.', category: 'Advanced', tag: 'Tenant Enabled', enabled: true, usageLimit: 'Real-Time Stream', icon: <MapPin className="h-4 w-4 text-emerald-600" /> },
    { key: 'orders', name: 'Quotes & Field Orders', desc: 'Product catalog, primary/secondary order booking, PDF invoices.', category: 'Sales', tag: 'Tenant Enabled', enabled: true, requires: ['crm'], usageLimit: '1,000 Orders / mo', icon: <CreditCard className="h-4 w-4 text-blue-600" /> },
    { key: 'service_jobs', name: 'Service Jobs & Dispatch', desc: 'Schedule maintenance jobs, assign site technicians & sign-off.', category: 'Operations', tag: 'Industry Recommended', enabled: true, requires: ['field_visits'], usageLimit: '500 Jobs / mo', icon: <Box className="h-4 w-4 text-indigo-600" /> },
    { key: 'chat', name: 'Team Chat & Messaging', desc: 'Internal encrypted team communication and real-time broadcast alerts.', category: 'Communication', tag: 'Add-on', enabled: false, usageLimit: 'Add-on (₹499/mo)', icon: <MessageSquare className="h-4 w-4 text-cyan-600" /> },
    { key: 'notifications', name: 'Multi-Channel Notifications', desc: 'Automated SMS, email, and push notification dispatch engine.', category: 'Automation', tag: 'Tenant Enabled', enabled: true, usageLimit: '10,000 Alerts / mo', icon: <Bell className="h-4 w-4 text-amber-600" /> },
    { key: 'knowledge_base', name: 'Knowledge Base & Collaterals', desc: 'Store product brochures, demo videos & technical guides for reps.', category: 'Enablement', tag: 'Add-on', enabled: false, usageLimit: '5 GB Storage', icon: <BookOpen className="h-4 w-4 text-purple-600" /> },
    { key: 'api_access', name: 'REST API & Webhooks', desc: 'Developer API access, webhook callbacks and custom endpoints.', category: 'Technical', tag: 'Upgrade Required', enabled: false, usageLimit: 'Enterprise Plan Only', icon: <Code className="h-4 w-4 text-slate-700" /> },
    { key: 'inventory', name: 'Sample & Stock Inventory', desc: 'Track stock distribution, medical samples, and promotional materials.', category: 'Inventory', tag: 'Industry Recommended', enabled: true, usageLimit: '5 Warehouses', icon: <Truck className="h-4 w-4 text-emerald-600" /> },
  ]);

  // Optional Integrations Data
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { key: 'whatsapp', name: 'WhatsApp Business API', category: 'Communication', status: 'Connected', enabled: true, lastSync: '2 mins ago', account: '+91 98765 43210', icon: <MessageSquare className="h-4 w-4 text-emerald-600" /> },
    { key: 'meta_leads', name: 'Meta Lead Ads (Facebook & IG)', category: 'Sales & Marketing', status: 'Connected', enabled: true, lastSync: '10 mins ago', account: 'Sunrise Healthcare Page', icon: <Share2 className="h-4 w-4 text-blue-600" /> },
    { key: 'google_maps', name: 'Google Maps Geocoding API', category: 'Productivity', status: 'Connected', enabled: true, lastSync: 'Live', account: 'Key: AIzaSy...9982', icon: <Globe className="h-4 w-4 text-red-600" /> },
    { key: 'razorpay', name: 'Razorpay Payment Gateway', category: 'Finance & ERP', status: 'Not Configured', enabled: false, account: 'Not connected', icon: <DollarSign className="h-4 w-4 text-indigo-600" /> },
    { key: 'tally', name: 'Tally / Zoho ERP Sync', category: 'Finance & ERP', status: 'Attention Required', enabled: true, lastSync: 'Failed (Invalid API Token)', account: 'Tally Prime v3.0', icon: <FileSpreadsheet className="h-4 w-4 text-amber-600" /> },
    { key: 'smtp_email', name: 'Custom SMTP Email Server', category: 'Communication', status: 'Connected', enabled: true, lastSync: '1 hour ago', account: 'smtp.sunrisehealthcare.com', icon: <Mail className="h-4 w-4 text-purple-600" /> },
  ]);

  const toggleCore = (key: string) => {
    setCoreModules((prev) =>
      prev.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m))
    );
    toast.success('Core module status updated');
  };

  const toggleAdvanced = (key: string) => {
    const target = advancedModules.find((m) => m.key === key);
    if (!target) return;

    // Check dependency enforcement
    if (!target.enabled && target.requires) {
      const missing = target.requires.filter(
        (reqKey) =>
          !coreModules.find((c) => c.key === reqKey && c.enabled) &&
          !advancedModules.find((a) => a.key === reqKey && a.enabled)
      );
      if (missing.length > 0) {
        toast.error(`Cannot enable ${target.name}. Requires: ${missing.join(', ')}`);
        return;
      }
    }

    setAdvancedModules((prev) =>
      prev.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m))
    );
    toast.success('Advanced module status updated');
  };

  const toggleIntegration = (key: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.key === key
          ? { ...i, enabled: !i.enabled, status: !i.enabled ? 'Connected' : 'Disabled' }
          : i
      )
    );
    toast.success('Integration status updated');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/platform/tenants/${tenantId}`)}
              className="text-xs font-bold text-slate-500 hover:text-[#0D1F3D] flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Tenant
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-extrabold text-[#0D1F3D]">Modules & Features</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#0D1F3D] mt-1">Tenant Module Entitlements</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage feature activation, plan entitlements, and third-party integrations for tenant <strong className="text-slate-800">{tenantId || 'apex-pharma'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => toast.success('Module settings saved')} className="font-bold text-slate-700">
            Save Entitlements
          </Button>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar (URL-aware) */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setTab('core')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
              activeTab === 'core'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Core Modules ({coreModules.filter((m) => m.enabled).length}/{coreModules.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('advanced')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
              activeTab === 'advanced'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Advanced Modules ({advancedModules.filter((m) => m.enabled).length}/{advancedModules.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('integrations')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
              activeTab === 'integrations'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Optional Integrations ({integrations.filter((i) => i.enabled).length}/{integrations.length})
          </button>
        </div>

        {/* Filter Search */}
        <div className="w-64 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0D1F3D]"
            />
          </div>
        </div>
      </div>

      {/* TAB A: CORE MODULES */}
      {activeTab === 'core' && (
        <div className="space-y-4">
          <div className="rounded-sm bg-[#F4F0FF] p-4 border border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="text-purple-950 font-semibold">Core modules are included in the tenant's base subscription plan.</span>
            </div>
            <span className="font-extrabold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-sm">Growth Plan Entitlement</span>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-4">Module Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Entitlement Tag</th>
                  <th className="py-3 px-4">Usage / Limit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coreModules
                  .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((mod) => (
                    <tr key={mod.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 border border-slate-200">
                            {mod.icon}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#0D1F3D]">{mod.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">Key: {mod.key}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 font-medium">{mod.desc}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          {mod.tag}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{mod.usageLimit}</td>
                      <td className="py-3.5 px-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={mod.enabled} onChange={() => toggleCore(mod.key)} label={mod.enabled ? 'Enabled' : 'Disabled'} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedConfigModule(mod)} className="h-7 px-2.5 text-[11px]">
                          Configure
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB B: ADVANCED MODULES */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div className="rounded-sm bg-blue-50 p-4 border border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="text-blue-950 font-semibold">Advanced modules may require plan upgrades or explicit prerequisite modules to be active.</span>
            </div>
            <span className="font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-sm">Dependency Enforced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {advancedModules
              .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((mod) => (
                <div
                  key={mod.key}
                  className={`rounded-sm border p-4 space-y-3 bg-white shadow-xs transition-all ${
                    mod.enabled ? 'border-slate-300' : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-slate-100 border border-slate-200">
                        {mod.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#0D1F3D]">{mod.name}</h4>
                        <p className="text-[10px] font-mono text-slate-400">Key: {mod.key}</p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={mod.enabled} onChange={() => toggleAdvanced(mod.key)} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{mod.desc}</p>

                  {mod.requires && (
                    <div className="rounded-sm bg-amber-50 px-2.5 py-1 border border-amber-200 text-[10px] text-amber-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                      <span>Requires: <strong>{mod.requires.join(', ')}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold border ${
                      mod.tag === 'Tenant Enabled'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : mod.tag === 'Industry Recommended'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {mod.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{mod.usageLimit}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB C: OPTIONAL INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {integrations
              .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((item) => (
                <div key={item.key} className="rounded-sm border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-slate-100 border border-slate-200">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#0D1F3D]">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold block">{item.category}</span>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={item.enabled} onChange={() => toggleIntegration(item.key)} />
                    </div>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Account:</span>
                      <span className="font-bold text-slate-700 text-[11px] truncate max-w-[140px]">{item.account}</span>
                    </div>
                    {item.lastSync && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Last Sync:</span>
                        <span className="font-semibold text-slate-600 text-[11px]">{item.lastSync}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold border ${
                      item.status === 'Connected'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'Attention Required'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.status}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => toast.info(`Configure ${item.name}`)} className="h-7 px-2.5 text-[11px]">
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Configure Modal */}
      {selectedConfigModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Configure {selectedConfigModule.name}</h3>
              <button type="button" onClick={() => setSelectedConfigModule(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <Input label="Max Usage Limit / Quota" defaultValue={selectedConfigModule.usageLimit} />
              <Select label="Access Level" value="All Field Reps" onChange={() => {}} searchable={true} options={[{ value: 'All Field Reps', label: 'All Field Reps' }, { value: 'Managers Only', label: 'Managers Only' }]} />
              <p className="text-[11px] text-slate-500">Changes apply immediately to this tenant workspace.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedConfigModule(null)}>Cancel</Button>
              <Button variant="accent" size="sm" onClick={() => { toast.success('Module parameters updated'); setSelectedConfigModule(null); }}>Save Parameters</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
