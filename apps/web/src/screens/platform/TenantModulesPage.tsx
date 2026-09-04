import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  CheckCircle2,
  Users,
  HardDrive,
  Code2,
  Link2,
  Info,
  PlusCircle,
  Puzzle,
  Download,
  Save,
  MessageSquare,
  MapPin,
  Clock,
  FileText,
  CheckSquare,
  BarChart3,
  Image as ImageIcon,
  Bell,
  Zap,
  Layers,
  Building2,
  Shield,
  CreditCard,
  Sliders,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { tenantService } from "../../features/platform/tenants/services/tenant.service";
import { Tenant, PlatformModule } from "../../features/platform/tenants/types/platform.types";
import { PLATFORM_MODULES } from "../../features/platform/tenants/fixtures/platform.fixtures";

interface ModuleItem {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  enabled: boolean;
  usersLimit?: string;
  usagePercent?: number;
  category: "core" | "advanced" | "integrations";
}

const MODULE_ICONS: Record<string, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  core_crm: { icon: Users, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  field_visits: { icon: MapPin, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  demo_scheduler: { icon: BarChart3, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  order_management: { icon: FileText, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  attendance: { icon: Clock, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  payroll: { icon: CreditCard, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  whatsapp_automation: { icon: MessageSquare, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  ai_copilot: { icon: Zap, iconBg: "bg-pink-100", iconColor: "text-pink-600" },
};

export function TenantModulesPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    (searchParams.get("tab") as "core" | "advanced" | "integrations") || "core";
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);

  const [draftModuleCodes, setDraftModuleCodes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tenantId) {
      tenantService.getTenantById(tenantId).then((t) => {
        if (t) {
          setTenant(t);
          setDraftModuleCodes(t.enabledModuleCodes || []);
          const mappedModules: ModuleItem[] = PLATFORM_MODULES.map((pm) => {
            const iconMeta = MODULE_ICONS[pm.code] || { icon: Layers, iconBg: "bg-slate-100", iconColor: "text-slate-600" };
            const category: "core" | "advanced" | "integrations" =
              pm.category === "CORE" || (pm.category as string) === "Core"
                ? "core"
                : pm.category === "AUTOMATION" || (pm.category as string) === "Automation"
                ? "integrations"
                : "advanced";
            return {
              id: pm.id,
              name: pm.name,
              code: pm.code,
              description: pm.description,
              icon: iconMeta.icon,
              iconBg: iconMeta.iconBg,
              iconColor: iconMeta.iconColor,
              enabled: t.enabledModuleCodes.includes(pm.code),
              category,
            };
          });
          setModules(mappedModules);
        }
      });
    }
  }, [tenantId]);

  const toggleModule = (id: string) => {
    const targetModule = modules.find((m) => m.id === id);
    if (!targetModule) return;

    const newEnabled = !targetModule.enabled;
    const updatedCodes = newEnabled
      ? Array.from(new Set([...draftModuleCodes, targetModule.code]))
      : draftModuleCodes.filter((c) => c !== targetModule.code);

    setDraftModuleCodes(updatedCodes);
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: newEnabled } : m))
    );
  };

  const handleSaveChanges = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      const updatedTenant = await tenantService.updateTenantModules(tenant.id, draftModuleCodes);
      setTenant(updatedTenant);
      toast.success("Tenant module entitlements saved successfully!");
    } catch {
      toast.error("Failed to save tenant modules");
    } finally {
      setSaving(false);
    }
  };

  const isDirty = tenant
    ? JSON.stringify([...draftModuleCodes].sort()) !== JSON.stringify([...tenant.enabledModuleCodes].sort())
    : false;

  if (!tenant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center font-sans space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Info className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#0D1F3D]">Tenant Not Found</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            This tenant could not be found or may no longer be available.
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate("/platform/tenants")}
          className="font-bold px-6 shadow-xs"
        >
          Back to All Tenants
        </Button>
      </div>
    );
  }

  const filteredModules = modules.filter(
    (m) =>
      m.category === activeTab &&
      (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* 1. Header Breadcrumb & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => navigate("/platform/dashboard")}
              className="hover:text-[#0D1F3D]"
            >
              Dashboard
            </button>
            <span>›</span>
            <button
              type="button"
              onClick={() => navigate("/platform/tenants")}
              className="hover:text-[#0D1F3D]"
            >
              Tenants
            </button>
            <span>›</span>
            <button
              type="button"
              onClick={() => navigate("/platform/tenants")}
              className="hover:text-[#0D1F3D]"
            >
              All Tenants
            </button>
            <span>›</span>
            <button
              type="button"
              onClick={() => navigate(`/platform/tenants/${tenantId}`)}
              className="hover:text-[#0D1F3D]"
            >
              {tenant?.companyName || 'Tenant'}
            </button>
            <span>›</span>
            <span className="font-extrabold text-[#0D1F3D]">
              Modules & Features
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">
              Tenant Modules & Features
            </h1>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-purple-100 text-purple-700">
              <Puzzle className="h-4.5 w-4.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage enabled modules, features and entitlements for {tenant?.companyName || 'this tenant'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/platform/tenants/${tenantId}`)}
            className="gap-1.5 font-bold text-slate-700"
          >
            ← Back to Tenant
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="gap-1.5 font-bold text-slate-700"
            >
              More Actions <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-sm border border-slate-200 bg-white p-1.5 shadow-xl text-xs font-semibold space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    navigate(`/platform/tenants/${tenantId}/users`);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xs"
                >
                  Manage Users
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    navigate("/platform/audit");
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-xs"
                >
                  Audit Logs
                </button>
              </div>
            )}
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={handleSaveChanges}
            disabled={!isDirty || saving}
            className="gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* 2. Top Tenant Banner Card (3 Columns) - Matching exact image mockup */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Col 1: Logo & Company Details */}
        <div className="lg:col-span-5 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-amber-200 bg-amber-50 text-amber-700 font-extrabold text-lg">
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.companyName} className="h-10 w-10 object-contain rounded-sm" />
            ) : (
              <Building2 className="h-7 w-7 text-amber-600" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">
                {tenant?.companyName || 'Loading...'}
              </h2>
              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                {tenant?.tenantStatus || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Industry:{" "}
              <strong className="text-slate-800">{tenant?.industryLabel || '—'}</strong> •
              Plan:{" "}
              <strong className="text-slate-800">{tenant?.planName || '—'}</strong>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Tenant Code:{" "}
              <strong className="font-mono text-slate-800">{tenant?.slug.toUpperCase() || '—'}</strong> •
              Licenses: <strong className="text-slate-800">{tenant?.userLicensesCount || 0}</strong>
            </p>
          </div>
        </div>

        {/* Col 2: Subscription Status */}
        <div className="lg:col-span-4 border-l border-slate-100 pl-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Subscription Status
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              {tenant?.subscriptionStatus || 'Active'}
            </span>
          </div>
          <p className="text-xs font-extrabold text-[#0D1F3D]">
            Created {tenant?.createdAt.split(' ·')[0] || '—'}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            MRR: ₹{tenant?.mrr.toLocaleString('en-IN') || 0} / mo
          </p>
        </div>

        {/* Col 3: Auto Renewal */}
        <div className="lg:col-span-3 border-l border-slate-100 pl-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Auto Renewal
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Enabled
            </span>
          </div>
          <p className="text-xs font-extrabold text-[#0D1F3D]">24 Jun 2026</p>
          <p className="text-[11px] font-mono font-bold text-slate-600">
            ₹4,24,786 (Yearly)
          </p>
        </div>
      </div>

      {/* 3. Main Grid Layout (2/3 Left Main, 1/3 Right Sidebar) */}
      <div className="flex justify-between">
        {/* LEFT MAIN AREA */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sub-Tabs & Action Bar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200">
              <div className="flex gap-8">
                <button
                  type="button"
                  onClick={() => setTab("core")}
                  className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                    activeTab === "core"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Core Modules
                </button>
                <button
                  type="button"
                  onClick={() => setTab("advanced")}
                  className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                    activeTab === "advanced"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Advanced Modules
                </button>
                <button
                  type="button"
                  onClick={() => setTab("integrations")}
                  className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
                    activeTab === "integrations"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Optional Integrations
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500 font-medium">
                Enable or disable modules for this tenant. Changes will apply
                based on subscription and entitlements.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Viewing entitlements matrix")}
                  className="h-8 text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50"
                >
                  View Entitlements
                </Button>
                <div className="relative w-52">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modules Table */}
          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Users / Limit</th>
                  <th className="py-3 px-4">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((m) => {
                  const Icon = m.icon;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-sm ${m.iconBg} ${m.iconColor} font-bold shrink-0`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-extrabold text-[#0D1F3D]">
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 font-medium">
                        {m.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleModule(m.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              m.enabled ? "bg-indigo-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                m.enabled ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-extrabold ${m.enabled ? "text-emerald-700" : "text-slate-400"}`}
                          >
                            {m.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {m.usersLimit || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {m.usagePercent ? (
                          <div className="flex items-center gap-2.5 w-32">
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full"
                                style={{ width: `${m.usagePercent}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700">
                              {m.usagePercent}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom 2 Callout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dotted Purple Request Card */}
            <div className="rounded-sm border border-dashed border-indigo-300 bg-indigo-50/30 p-5 space-y-3 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0D1F3D]">
                    Request Additional Module
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Can't find the module you need? Submit a request to enable
                    it for this tenant.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Module request submitted")}
                className="w-fit text-xs font-bold text-indigo-600 border-indigo-200 bg-white"
              >
                Request Module
              </Button>
            </div>

            {/* Soft Blue Info Card */}
            <div className="rounded-sm border border-indigo-100 bg-indigo-50/50 p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-950 font-extrabold">
                <Info className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Module Changes Information</span>
              </div>
              <ul className="space-y-1 text-[11px] text-indigo-900 font-medium pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />{" "}
                  Enabled modules are immediately available to users.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />{" "}
                  Disabled modules will hide all related features and data.
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />{" "}
                  Billing adjustments will reflect at the next renewal.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR AREA ("MODULES SUMMARY") */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 w-96">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Modules Summary
            </h3>

            {/* 5 Stat Cards with Circular Icon Badges */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-sm border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Enabled Modules
                  </span>
                  <span className="text-base font-extrabold text-[#0D1F3D]">
                    10 / 17
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Core + Advanced
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <div className="p-3.5 rounded-sm border border-blue-100 bg-blue-50/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Total Users Impacted
                  </span>
                  <span className="text-base font-extrabold text-[#0D1F3D]">
                    126 / 150
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    84% of user limit
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="p-3.5 rounded-sm border border-purple-100 bg-purple-50/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Storage Utilization
                  </span>
                  <span className="text-base font-extrabold text-[#0D1F3D]">
                    128 GB / 200 GB
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    64% used
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500 text-white font-bold">
                  <HardDrive className="h-5 w-5" />
                </div>
              </div>

              <div className="p-3.5 rounded-sm border border-amber-100 bg-amber-50/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    API Requests (Monthly)
                  </span>
                  <span className="text-base font-extrabold text-[#0D1F3D]">
                    64,250 / 100,000
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    64% used
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
                  <Code2 className="h-5 w-5" />
                </div>
              </div>

              <div className="p-3.5 rounded-sm border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Active Integrations
                  </span>
                  <span className="text-base font-extrabold text-[#0D1F3D]">
                    3 / 8
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    Connected
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
                  <Link2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Recent Module Changes Card */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-xs font-extrabold text-[#0D1F3D]">
                Recent Module Changes
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">
                      Advanced Reports enabled
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      by Amit Sharma • 24 May 2026, 10:15 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">
                      GPS & Location Tracking enabled
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      by Amit Sharma • 24 May 2026, 10:15 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">
                      Media & Attachments storage increased
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      by Amit Sharma • 24 May 2026, 10:15 AM
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/platform/audit")}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View Full Activity Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingCartIcon(props: any) {
  return <FileText {...props} />;
}

function WrenchIcon(props: any) {
  return <Sliders {...props} />;
}
