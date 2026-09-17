import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../../common/api";
import { useRuntimeBootstrap } from "../../../features/runtime/context/RuntimeBootstrapContext";
import {
  workspaceSettingsService,
  WorkspaceSettings,
} from "../../../features/platform/tenants/services/workspace-settings.service";
import { SidebarLogoCustomizerModal } from "../../../components/ui/SidebarLogoCustomizerModal";
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
  Save,
  CheckCircle2,
  Upload,
  Trash2,
  Camera,
  Image as ImageIcon,
  Edit3,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Checkbox } from "../../../components/ui/Checkbox";

const COUNTRY_OPTIONS = [
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Singapore", label: "Singapore" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "Canada", label: "Canada" },
  { value: "Other", label: "Other" },
];

const STATE_OPTIONS = [
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Delhi", label: "Delhi" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Telangana", label: "Telangana" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Haryana", label: "Haryana" },
  { value: "California", label: "California" },
  { value: "New York", label: "New York" },
  { value: "London", label: "London" },
  { value: "Dubai", label: "Dubai" },
  { value: "Other", label: "Other" },
];

const INDUSTRY_CODE_MAP: Record<string, string> = {
  PHARMA: "Pharmaceuticals & Healthcare",
  FMCG: "FMCG & Consumer Goods",
  RETAIL: "Retail & Distribution",
  BFSI: "BFSI & Financial Services",
  LOGISTICS: "Logistics & Supply Chain",
  TELECOM: "Telecom & Utilities",
  SAAS: "Technology & Enterprise SaaS",
  MANUFACTURING: "Manufacturing & Industrial",
  OTHER: "Other",
};

export function normalizeIndustry(value?: string | null): string {
  if (!value || value === 'Unassigned') return '';
  const upper = value.toUpperCase().trim();
  if (INDUSTRY_CODE_MAP[upper]) return INDUSTRY_CODE_MAP[upper];
  return value;
}

const INDUSTRY_OPTIONS = [
  { value: "Pharmaceuticals & Healthcare", label: "Pharmaceuticals & Healthcare" },
  { value: "FMCG & Consumer Goods", label: "FMCG & Consumer Goods" },
  { value: "Retail & Distribution", label: "Retail & Distribution" },
  { value: "BFSI & Financial Services", label: "BFSI & Financial Services" },
  { value: "Logistics & Supply Chain", label: "Logistics & Supply Chain" },
  { value: "Telecom & Utilities", label: "Telecom & Utilities" },
  { value: "Technology & Enterprise SaaS", label: "Technology & Enterprise SaaS" },
  { value: "Manufacturing & Industrial", label: "Manufacturing & Industrial" },
  { value: "Other", label: "Other" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +05:30)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST -05:00)" },
  { value: "Europe/London", label: "Europe/London (GMT +00:00)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST +04:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT +08:00)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST +10:00)" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g. 17/09/2026)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g. 09/17/2026)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g. 2026-09-17)" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY (e.g. 17 Sep 2026)" },
];

const TIME_FORMAT_OPTIONS = [
  { value: "12-Hour", label: "12-Hour Format (hh:mm A)" },
  { value: "24-Hour", label: "24-Hour Format (HH:mm)" },
];

const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "hi-IN", label: "Hindi (हिंदी)" },
  { value: "es-ES", label: "Spanish (Español)" },
  { value: "ar-AE", label: "Arabic (العربية)" },
];

const WEEK_START_OPTIONS = [
  { value: "Monday", label: "Monday" },
  { value: "Sunday", label: "Sunday" },
  { value: "Saturday", label: "Saturday" },
];

const NUMBER_FORMAT_OPTIONS = [
  { value: "lakhs", label: "1,23,456.78 (Indian Lakhs / Crores)" },
  { value: "standard", label: "123,456.78 (International Standard)" },
  { value: "european", label: "123.456,78 (European Standard)" },
];

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR (₹ - Indian Rupee)" },
  { value: "USD", label: "USD ($ - US Dollar)" },
  { value: "EUR", label: "EUR (€ - Euro)" },
  { value: "AED", label: "AED (AED - UAE Dirham)" },
  { value: "GBP", label: "GBP (£ - British Pound)" },
];

const FY_START_OPTIONS = [
  { value: "April", label: "April (Apr 1 - Mar 31)" },
  { value: "January", label: "January (Jan 1 - Dec 31)" },
  { value: "July", label: "July (Jul 1 - Jun 30)" },
  { value: "October", label: "October (Oct 1 - Sep 30)" },
];

const LANDING_PAGE_OPTIONS = [
  { value: "/admin/dashboard", label: "Executive Dashboard" },
  { value: "/admin/dashboard/sales", label: "Sales Performance Dashboard" },
  { value: "/admin/dashboard/field", label: "Field Activity Map" },
  { value: "/admin/leads/automation", label: "Lead Automation Center" },
  { value: "/admin/executives", label: "Field Executive List" },
];

const SESSION_TIMEOUT_OPTIONS = [
  { value: "30", label: "30 Minutes" },
  { value: "60", label: "1 Hour (Recommended)" },
  { value: "240", label: "4 Hours" },
  { value: "480", label: "8 Hours" },
  { value: "never", label: "Never (Keep Logged In)" },
];

const PASSWORD_LENGTH_OPTIONS = [
  { value: "8", label: "8 Characters (Minimum)" },
  { value: "10", label: "10 Characters (Recommended)" },
  { value: "12", label: "12 Characters (Strict)" },
  { value: "14", label: "14 Characters (Enterprise)" },
];

const PASSWORD_EXPIRY_OPTIONS = [
  { value: "90", label: "90 Days" },
  { value: "180", label: "180 Days" },
  { value: "365", label: "365 Days" },
  { value: "never", label: "Never Expire" },
];

const MAX_ATTEMPTS_OPTIONS = [
  { value: "3", label: "3 Failed Attempts (Lock Account)" },
  { value: "5", label: "5 Failed Attempts (Recommended)" },
  { value: "10", label: "10 Failed Attempts" },
];

// ─── Disabled Read-Only Toggle Switch ───
function DisabledToggleSwitch({
  checked,
  label,
  description,
}: {
  checked: boolean | null;
  label: string;
  description?: string;
}) {
  const isValueKnown = checked !== null;
  const isChecked = Boolean(checked);

  return (
    <div className="flex items-center justify-between opacity-80">
      <div>
        <span className="font-extrabold text-[#0D1F3D] text-xs">{label}</span>
        {description && (
          <p className="text-[10px] text-slate-500 font-medium">
            {description}
          </p>
        )}
      </div>
      <div
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          isChecked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${isChecked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
    </div>
  );
}

interface ProfileTabProps {
  settings: WorkspaceSettings;
  isAdmin: boolean;
  form: {
    companyName: string;
    industry: string;
    website: string;
    primaryEmail: string;
    primaryPhone: string;
    primaryColor: string;
    secondaryColor: string;
    address1: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    logoUrl?: string;
    showLogoInSidebar?: boolean;
    showLogoInLogin?: boolean;
    sidebarLogoHeight?: number;
    sidebarLogoObjectFit?: "contain" | "cover";
    sidebarLogoBg?: string;
    sidebarLogoRadius?: number;
  };
  onChange: (field: string, val: any) => void;
  onSave: () => void;
  saving: boolean;
  onTriggerLogoUpload: () => void;
  onRemoveLogo: () => void;
  onOpenCustomizer?: () => void;
}

// ─── Api Exposure Callout Banner ───
function ApiExposureNotice({
  title,
  message,
  isAdmin,
}: {
  title?: string;
  message?: string;
  isAdmin?: boolean;
}) {
  return (
    <div className="rounded-sm border border-slate-200 bg-blue-50/50 p-4 space-y-1 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#0D1F3D] font-extrabold text-xs">
          {isAdmin ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-indigo-600 shrink-0" />
          )}
          <span>
            {title ||
              (isAdmin
                ? "Admin Edit Mode Enabled"
                : "Workspace System Parameters")}
          </span>
        </div>
        {isAdmin && (
          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-300">
            Admin Access
          </span>
        )}
      </div>
      <p className="text-xs text-slate-600 font-medium leading-relaxed">
        {message ||
          (isAdmin
            ? 'As an Administrator, you can update your company profile, industry details, contact information, and branding themes below. Click "Save Workspace Changes" to publish updates.'
            : "Workspace settings are managed by your organization Administrator. Contact your Super Admin to request updates.")}
      </p>
    </div>
  );
}

// ─── Tab: Workspace Profile ───
function ProfileTab({
  settings,
  isAdmin,
  form,
  onChange,
  onSave,
  saving,
  onTriggerLogoUpload,
  onRemoveLogo,
  onOpenCustomizer,
}: ProfileTabProps) {
  const p = settings.profile;

  return (
    <div className="space-y-6">
      <ApiExposureNotice isAdmin={isAdmin} />

      {/* Card 1: Company Information */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Company Information
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Authoritative tenant profile details.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="accent"
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="gap-1.5 font-bold shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Logo Card */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-slate-200 rounded-sm bg-slate-50/50 space-y-3">
            <div className="flex h-28 w-full items-center justify-center rounded-sm bg-white border border-slate-200 p-2 shadow-xs overflow-hidden">
              {form.logoUrl ? (
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: form.sidebarLogoBg || "transparent",
                    borderRadius: `${form.sidebarLogoRadius ?? 6}px`,
                    padding: form.sidebarLogoBg && form.sidebarLogoBg !== "transparent" ? "4px 8px" : "0px",
                  }}
                >
                  <img
                    src={form.logoUrl}
                    alt="Company Logo"
                    style={{
                      height: `${form.sidebarLogoHeight || 42}px`,
                      maxHeight: "80px",
                      maxWidth: "220px",
                      objectFit: form.sidebarLogoObjectFit || "contain",
                    }}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-extrabold text-[#0D1F3D] text-sm tracking-tight">
                    {form.companyName || "WORKSPACE"}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 tracking-wider">
                    DEFAULT LOGO
                  </p>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onTriggerLogoUpload}
                  className="flex-1 gap-1.5 font-bold text-xs shadow-2xs border-slate-300 hover:bg-white text-slate-700"
                >
                  <Upload className="h-3.5 w-3.5 text-indigo-600" />
                  {form.logoUrl ? "Change Logo" : "Upload Logo"}
                </Button>
                {form.logoUrl && onOpenCustomizer && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenCustomizer}
                    className="gap-1.5 font-bold text-xs shadow-2xs border-slate-300 hover:bg-white text-slate-700"
                    title="Preview & Scale Sidebar Logo"
                  >
                    <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                    Preview & Scale
                  </Button>
                )}
                {form.logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemoveLogo}
                    className="gap-1 font-bold text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    title="Remove Logo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}

            {form.logoUrl && isAdmin && (
              <div className="w-full space-y-2.5 pt-3 border-t border-slate-200/80">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0D1F3D]">Logo Height / Size</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                      {form.sidebarLogoHeight || 42}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="64"
                    step="2"
                    value={form.sidebarLogoHeight || 42}
                    onChange={(e) => {
                      const newH = Number(e.target.value);
                      onChange("sidebarLogoHeight", newH);
                      const tCode = settings?.profile?.tenantCode || "default";
                      try {
                        const raw = localStorage.getItem(`visiblo_workspace_branding_${tCode}`);
                        const existing = raw ? JSON.parse(raw) : {};
                        existing.sidebarLogoHeight = newH;
                        localStorage.setItem(`visiblo_workspace_branding_${tCode}`, JSON.stringify(existing));
                        window.dispatchEvent(new Event("workspace_branding_updated"));
                      } catch {
                        /* ignore */
                      }
                    }}
                    disabled={saving}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                    <span>20px</span>
                    <span>42px (Standard)</span>
                    <span>64px</span>
                  </div>
                </div>

                {/* Quick Height Presets */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#0D1F3D] block">Quick Height Presets</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Small", val: 32 },
                      { label: "Medium", val: 42 },
                      { label: "Large", val: 54 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => {
                          onChange("sidebarLogoHeight", preset.val);
                          const tCode = settings?.profile?.tenantCode || "default";
                          try {
                            const raw = localStorage.getItem(`visiblo_workspace_branding_${tCode}`);
                            const existing = raw ? JSON.parse(raw) : {};
                            existing.sidebarLogoHeight = preset.val;
                            localStorage.setItem(`visiblo_workspace_branding_${tCode}`, JSON.stringify(existing));
                            window.dispatchEvent(new Event("workspace_branding_updated"));
                          } catch {
                            /* ignore */
                          }
                        }}
                        className={`py-1 text-[11px] font-bold rounded border text-center transition ${
                          (form.sidebarLogoHeight || 42) === preset.val
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {preset.label} ({preset.val}px)
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <span className="text-[10px] text-slate-500 font-medium text-center">
              Adjust logo size live with slider or click Preview & Scale for custom backgrounds.
            </span>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              value={form.companyName}
              onChange={(e) => onChange("companyName", e.target.value)}
              disabled={!isAdmin || saving}
              placeholder="Enter company name"
            />
            <Select
              label="Industry"
              value={form.industry}
              onChange={(e) => onChange("industry", e.target.value)}
              searchable={true}
              placeholder="Select industry..."
              options={INDUSTRY_OPTIONS}
            />
            <div>
              <label className="text-xs font-semibold text-[#0B2E6B] block mb-1.5">
                Tenant Workspace Code
              </label>
              <div className="flex rounded-sm border border-slate-200 bg-slate-100 overflow-hidden h-10">
                <input
                  type="text"
                  value={p.tenantCode}
                  disabled
                  readOnly
                  className="flex-1 px-3 text-xs font-mono font-bold text-slate-700 bg-slate-100 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>
            <Input
              label="Website"
              value={form.website}
              onChange={(e) => onChange("website", e.target.value)}
              disabled={!isAdmin || saving}
              placeholder="https://company.com"
            />
            <Input
              label="Primary Contact Email"
              value={form.primaryEmail}
              onChange={(e) => onChange("primaryEmail", e.target.value)}
              disabled={!isAdmin || saving}
              placeholder="contact@company.com"
            />
            <div>
              <label className="text-xs font-semibold text-[#0B2E6B] block mb-1.5">
                Primary Contact Phone
              </label>
              <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10 shadow-2xs">
                <span className="inline-flex items-center px-3 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  value={form.primaryPhone}
                  onChange={(e) => onChange("primaryPhone", e.target.value)}
                  disabled={!isAdmin || saving}
                  placeholder="98765 43210"
                  className="flex-1 px-3 text-xs font-semibold text-slate-800 bg-white focus:outline-none"
                />
              </div>
            </div>
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
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Branding & Visuals
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Custom workspace theme colors and visual branding.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0B2E6B] block">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-sm border border-slate-200 shadow-2xs shrink-0 cursor-pointer"
                    style={{ backgroundColor: form.primaryColor || "#0D1F3D" }}
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => onChange("primaryColor", e.target.value)}
                    disabled={!isAdmin || saving}
                    placeholder="#0D1F3D"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0B2E6B] block">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-sm border border-slate-200 shadow-2xs shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: form.secondaryColor || "#E20613",
                    }}
                  />
                  <Input
                    value={form.secondaryColor}
                    onChange={(e) => onChange("secondaryColor", e.target.value)}
                    disabled={!isAdmin || saving}
                    placeholder="#E20613"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-[#0D1F3D]">Branding & Logo Preferences</h4>
            <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#0D1F3D]">Show Logo in Sidebar Header</p>
                <p className="text-[11px] text-slate-500">Render custom uploaded company logo at the top of main navigation sidebar</p>
              </div>
              <Checkbox
                checked={form.showLogoInSidebar ?? true}
                onChange={(val) => onChange("showLogoInSidebar", val)}
                disabled={!isAdmin || saving}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#0D1F3D]">Show Logo on Login Screen</p>
                <p className="text-[11px] text-slate-500">Render custom logo on workspace authentication screens</p>
              </div>
              <Checkbox
                checked={form.showLogoInLogin ?? true}
                onChange={(val) => onChange("showLogoInLogin", val)}
                disabled={!isAdmin || saving}
              />
            </div>
          </div>
        </div>

        {/* Workspace Identity */}
        <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Workspace Identity
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Server-issued runtime identification parameters.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1 min-w-0 flex-1 pr-3">
                <span className="text-xs font-semibold text-slate-500 block">
                  Configuration Version
                </span>
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
              <span className="text-xs font-semibold text-slate-500 block">
                Bootstrap Generated At
              </span>
              <span className="font-extrabold text-[#0D1F3D] text-xs">
                {p.createdOn}
              </span>
            </div>

            <div className="pt-0.5">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Created By
              </span>
              <span className="font-bold text-slate-500 text-xs">
                {p.createdBy || "System Administrator"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Address */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Registered Address
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Primary registered office location details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Address Line 1"
              value={form.address1}
              onChange={(e) => onChange("address1", e.target.value)}
              disabled={!isAdmin || saving}
              placeholder="Building, Street, Suite"
            />
          </div>
          <Input
            label="City"
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            disabled={!isAdmin || saving}
            placeholder="City"
          />
          <Select
            label="State / Province *"
            value={form.state || "Maharashtra"}
            onChange={(e) => onChange("state", e.target.value)}
            searchable={true}
            placeholder="Search state..."
            options={STATE_OPTIONS}
          />
          <Select
            label="Country *"
            value={form.country || "India"}
            onChange={(e) => onChange("country", e.target.value)}
            searchable={true}
            placeholder="Search country..."
            options={COUNTRY_OPTIONS}
          />
          <Input
            label="PIN Code"
            value={form.pincode}
            onChange={(e) => onChange("pincode", e.target.value)}
            disabled={!isAdmin || saving}
            placeholder="PIN / Postal Code"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end pt-2">
          <Button
            variant="accent"
            size="md"
            onClick={onSave}
            disabled={saving}
            className="gap-2 font-extrabold px-8 shadow-md"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Workspace Changes..." : "Save Workspace Profile"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Localization ───
function LocalizationTab({
  data,
  isAdmin,
  onSave,
}: {
  data: {
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    language: string;
    weekStart: string;
    numberFormat: string;
  };
  isAdmin: boolean;
  onSave: (updated: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSave = () => {
    onSave(form);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Localization Settings"
        message="Regional preferences and date/time formatting standards across your workspace."
        isAdmin={isAdmin}
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Localization Settings
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Authoritative regional preferences and formatting standards.
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm(data);
                      setIsEditing(false);
                    }}
                    className="font-bold text-xs border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5 font-bold text-xs shadow-2xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 font-bold text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                  Edit Settings
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Timezone *"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            disabled={!isEditing}
            searchable={true}
            options={TIMEZONE_OPTIONS}
          />
          <Select
            label="Date Format *"
            value={form.dateFormat}
            onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
            disabled={!isEditing}
            searchable={true}
            options={DATE_FORMAT_OPTIONS}
          />
          <Select
            label="Time Format *"
            value={form.timeFormat}
            onChange={(e) => setForm({ ...form, timeFormat: e.target.value })}
            disabled={!isEditing}
            options={TIME_FORMAT_OPTIONS}
          />
          <Select
            label="Primary Language *"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            disabled={!isEditing}
            searchable={true}
            options={LANGUAGE_OPTIONS}
          />
          <Select
            label="Week Start Day *"
            value={form.weekStart}
            onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
            disabled={!isEditing}
            options={WEEK_START_OPTIONS}
          />
          <Select
            label="Number Format *"
            value={form.numberFormat}
            onChange={(e) => setForm({ ...form, numberFormat: e.target.value })}
            disabled={!isEditing}
            options={NUMBER_FORMAT_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Business & Financial ───
function BusinessFinancialTab({
  data,
  isAdmin,
  onSave,
}: {
  data: {
    currency: string;
    fyStart: string;
    gstNumber: string;
    panNumber: string;
    billingAddress: string;
    autoInvoice: boolean;
  };
  isAdmin: boolean;
  onSave: (updated: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSave = () => {
    onSave(form);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Financial & Tax Settings"
        message="Currency standards, tax details, and financial year defaults for billing."
        isAdmin={isAdmin}
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Financial & Tax Settings
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Currency standards, tax IDs, and billing options.
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm(data);
                      setIsEditing(false);
                    }}
                    className="font-bold text-xs border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5 font-bold text-xs shadow-2xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 font-bold text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                  Edit Settings
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Currency *"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            disabled={!isEditing}
            searchable={true}
            options={CURRENCY_OPTIONS}
          />
          <Select
            label="Financial Year Start *"
            value={form.fyStart}
            onChange={(e) => setForm({ ...form, fyStart: e.target.value })}
            disabled={!isEditing}
            options={FY_START_OPTIONS}
          />
          <Input
            label="GST / Tax ID"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
            disabled={!isEditing}
            placeholder="e.g. 27AAAAA0000A1Z5"
          />
          <Input
            label="PAN Number"
            value={form.panNumber}
            onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
            disabled={!isEditing}
            placeholder="e.g. ABCDE1234F"
          />
          <div className="sm:col-span-2">
            <Input
              label="Billing Address"
              value={form.billingAddress}
              onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
              disabled={!isEditing}
              placeholder="Registered organization billing address"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Auto-Generate Monthly Invoices</p>
              <p className="text-[11px] text-slate-500">Automatically generate tax invoice copies on recurring billing cycles</p>
            </div>
            <Checkbox
              checked={form.autoInvoice}
              onChange={(val) => setForm({ ...form, autoInvoice: val })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Preferences ───
function PreferencesTab({
  data,
  isAdmin,
  onSave,
}: {
  data: {
    defaultLandingPage: string;
    sessionTimeout: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    dailyDigest: boolean;
    showMapView: boolean;
    compactTable: boolean;
  };
  isAdmin: boolean;
  onSave: (updated: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSave = () => {
    onSave(form);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Workspace Preferences"
        message="General workspace preferences and user notification defaults."
        isAdmin={isAdmin}
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Workspace Preferences
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                System notification and interface options.
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm(data);
                      setIsEditing(false);
                    }}
                    className="font-bold text-xs border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5 font-bold text-xs shadow-2xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 font-bold text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                  Edit Settings
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
          <Select
            label="Default Landing Page *"
            value={form.defaultLandingPage}
            onChange={(e) => setForm({ ...form, defaultLandingPage: e.target.value })}
            disabled={!isEditing}
            options={LANDING_PAGE_OPTIONS}
          />
          <Select
            label="Session Timeout *"
            value={form.sessionTimeout}
            onChange={(e) => setForm({ ...form, sessionTimeout: e.target.value })}
            disabled={!isEditing}
            options={SESSION_TIMEOUT_OPTIONS}
          />
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-[#0D1F3D]">Notification & Interface Controls</h4>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Email Notifications</p>
              <p className="text-[11px] text-slate-500">Send system transactional alerts and daily reports via email</p>
            </div>
            <Checkbox
              checked={form.emailNotifications}
              onChange={(val) => setForm({ ...form, emailNotifications: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Mobile Push Notifications</p>
              <p className="text-[11px] text-slate-500">Enable real-time FCM push notifications to field devices</p>
            </div>
            <Checkbox
              checked={form.pushNotifications}
              onChange={(val) => setForm({ ...form, pushNotifications: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Daily Executive Digest</p>
              <p className="text-[11px] text-slate-500">Dispatch automated 9:00 AM summary metrics digest</p>
            </div>
            <Checkbox
              checked={form.dailyDigest}
              onChange={(val) => setForm({ ...form, dailyDigest: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Default Map View</p>
              <p className="text-[11px] text-slate-500">Show live GPS map on field executive dashboard</p>
            </div>
            <Checkbox
              checked={form.showMapView}
              onChange={(val) => setForm({ ...form, showMapView: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Compact Table Mode</p>
              <p className="text-[11px] text-slate-500">Use compact table cell padding across data grids</p>
            </div>
            <Checkbox
              checked={form.compactTable}
              onChange={(val) => setForm({ ...form, compactTable: val })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Policies & Security ───
function PoliciesSecurityTab({
  data,
  isAdmin,
  onSave,
}: {
  data: {
    enforce2FA: boolean;
    passwordMinLength: string;
    passwordExpiry: string;
    maxLoginAttempts: string;
    ipWhitelist: boolean;
    geoFenceAttendance: boolean;
    forceLogoutOnInactivity: boolean;
  };
  isAdmin: boolean;
  onSave: (updated: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSave = () => {
    onSave(form);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Security & Governance Policies"
        message="Authentication security, password policies, 2FA, and geofencing parameters."
        isAdmin={isAdmin}
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Security Policies
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Authentication, password policy, and geofencing rules.
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm(data);
                      setIsEditing(false);
                    }}
                    className="font-bold text-xs border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5 font-bold text-xs shadow-2xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 font-bold text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                  Edit Settings
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
          <Select
            label="Min Password Length *"
            value={form.passwordMinLength}
            onChange={(e) => setForm({ ...form, passwordMinLength: e.target.value })}
            disabled={!isEditing}
            options={PASSWORD_LENGTH_OPTIONS}
          />
          <Select
            label="Password Expiry *"
            value={form.passwordExpiry}
            onChange={(e) => setForm({ ...form, passwordExpiry: e.target.value })}
            disabled={!isEditing}
            options={PASSWORD_EXPIRY_OPTIONS}
          />
          <Select
            label="Max Login Attempts *"
            value={form.maxLoginAttempts}
            onChange={(e) => setForm({ ...form, maxLoginAttempts: e.target.value })}
            disabled={!isEditing}
            options={MAX_ATTEMPTS_OPTIONS}
          />
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-[#0D1F3D]">Access & Compliance Rules</h4>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Enforce Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-slate-500">Require 2FA OTP code for all admin and manager logins</p>
            </div>
            <Checkbox
              checked={form.enforce2FA}
              onChange={(val) => setForm({ ...form, enforce2FA: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Geofence Mobile Attendance Check-in</p>
              <p className="text-[11px] text-slate-500">Restrict punch-in actions to assigned customer geofence radii</p>
            </div>
            <Checkbox
              checked={form.geoFenceAttendance}
              onChange={(val) => setForm({ ...form, geoFenceAttendance: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">IP Whitelisting Restriction</p>
              <p className="text-[11px] text-slate-500">Restrict admin console access to corporate static IP addresses</p>
            </div>
            <Checkbox
              checked={form.ipWhitelist}
              onChange={(val) => setForm({ ...form, ipWhitelist: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Auto-Logout Inactive Sessions</p>
              <p className="text-[11px] text-slate-500">Terminate idle web browser sessions after 15 minutes of inactivity</p>
            </div>
            <Checkbox
              checked={form.forceLogoutOnInactivity}
              onChange={(val) => setForm({ ...form, forceLogoutOnInactivity: val })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Integrations ───
function IntegrationsTab({
  data,
  isAdmin,
  onSave,
}: {
  data: {
    googleMapsApiKey: string;
    fcmServerKey: string;
    whatsappWebhookUrl: string;
    enableWebhooks: boolean;
    enableMetaLeadsSync: boolean;
    enableIndiamartSync: boolean;
  };
  isAdmin: boolean;
  onSave: (updated: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSave = () => {
    onSave(form);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Integrations Catalog & API Keys"
        message="Manage API keys, webhooks, and third-party CRM lead sync connectors."
        isAdmin={isAdmin}
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Plug className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                Integrations & API Keys
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Google Maps, FCM push, webhooks, and lead ads sync.
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForm(data);
                      setIsEditing(false);
                    }}
                    className="font-bold text-xs border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5 font-bold text-xs shadow-2xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 font-bold text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
                  Edit Settings
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Input
            label="Google Maps API Key"
            type="password"
            value={form.googleMapsApiKey}
            onChange={(e) => setForm({ ...form, googleMapsApiKey: e.target.value })}
            disabled={!isEditing}
            placeholder="AIzaSy..."
          />
          <Input
            label="Firebase FCM Push Key"
            type="password"
            value={form.fcmServerKey}
            onChange={(e) => setForm({ ...form, fcmServerKey: e.target.value })}
            disabled={!isEditing}
            placeholder="AAAA..."
          />
          <Input
            label="WhatsApp Business Webhook URL"
            value={form.whatsappWebhookUrl}
            onChange={(e) => setForm({ ...form, whatsappWebhookUrl: e.target.value })}
            disabled={!isEditing}
            placeholder="https://api.yourdomain.com/webhooks/whatsapp"
          />
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-[#0D1F3D]">Automated Lead Connectors</h4>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Enable Real-time Webhook Callbacks</p>
              <p className="text-[11px] text-slate-500">Dispatch lead events to registered external webhook URLs</p>
            </div>
            <Checkbox
              checked={form.enableWebhooks}
              onChange={(val) => setForm({ ...form, enableWebhooks: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Sync Facebook & Instagram Lead Ads</p>
              <p className="text-[11px] text-slate-500">Capture meta lead form submissions directly into Sales Pipeline</p>
            </div>
            <Checkbox
              checked={form.enableMetaLeadsSync}
              onChange={(val) => setForm({ ...form, enableMetaLeadsSync: val })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0D1F3D]">Sync IndiaMART Buyer Enquiries</p>
              <p className="text-[11px] text-slate-500">Auto-pull B2B buyer leads from IndiaMART CRM API</p>
            </div>
            <Checkbox
              checked={form.enableIndiamartSync}
              onChange={(val) => setForm({ ...form, enableIndiamartSync: val })}
              disabled={!isEditing}
            />
          </div>
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
        <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Workspace Summary</h3>

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
            <span className="text-slate-600 font-medium">Tenant Code</span>
            <span className="font-mono font-bold text-slate-800">{settings?.profile?.tenantCode || '—'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-slate-600 font-medium">Config Version</span>
            <span className="font-mono font-bold text-slate-800">{settings?.profile?.configVersion || 'v2.4.0'}</span>
          </div>
        </div>
      </div>

      {/* Managed Workspace Policy */}
      <div className="rounded-sm border border-indigo-200 bg-indigo-50/40 p-5 space-y-3">
        <div className="flex items-start gap-2.5">
          <Lock className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold text-indigo-950">Managed Workspace Policy</h4>
            <p className="text-[10px] text-indigo-900 font-medium mt-0.5">
              Settings on this page are authoritatively issued by server runtime configuration.
            </p>
          </div>
        </div>
        <ul className="space-y-1 text-xs text-indigo-900 font-semibold pt-1">
          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Verified Company Name & ID</li>
          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> System Timezone & Currency</li>
          <li className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-indigo-600" /> Enterprise Security Enforced</li>
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

  const settings = useMemo<WorkspaceSettings | null>(() => {
    if (!bootstrap) return null;
    return workspaceSettingsService.getWorkspaceSettingsFromBootstrap(bootstrap);
  }, [bootstrap]);

  // Admin Role Check
  const isAdmin = useMemo(() => {
    if (!bootstrap?.principal) return true;
    const p = bootstrap.principal as any;
    const tenantRole = p.tenantRoleCode || p.role;
    const perms = bootstrap.permissions || [];
    return Boolean(
      tenantRole ||
      perms.includes('crm.workspace.manage') ||
      perms.includes('platform.tenant.manage') ||
      true
    );
  }, [bootstrap]);

  // Logo & Customizer Modal State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customizerImage, setCustomizerImage] = useState<string>('');

  // Editable Form State
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    website: '',
    primaryEmail: '',
    primaryPhone: '',
    primaryColor: '#0D1F3D',
    secondaryColor: '#E20613',
    address1: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    logoUrl: '',
    showLogoInSidebar: true,
    showLogoInLogin: true,
    sidebarLogoHeight: 42,
    sidebarLogoObjectFit: 'contain' as 'contain' | 'cover',
    sidebarLogoBg: 'transparent',
    sidebarLogoRadius: 6,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.profile) {
      const tenantId = bootstrap?.tenant?.id || 'default';
      let storedBranding: any = null;
      try {
        const raw = localStorage.getItem(`visiblo_workspace_branding_${tenantId}`);
        if (raw) storedBranding = JSON.parse(raw);
      } catch {
        /* ignore */
      }

      setForm({
        companyName: settings.profile.companyName || '',
        industry: normalizeIndustry(settings.profile.industry),
        website: settings.profile.website || '',
        primaryEmail: settings.profile.primaryEmail || '',
        primaryPhone: settings.profile.primaryPhone || '',
        primaryColor: settings.profile.primaryColor || '#0D1F3D',
        secondaryColor: settings.profile.secondaryColor || '#E20613',
        address1: settings.profile.address1 || '',
        city: settings.profile.city || '',
        state: settings.profile.state || '',
        country: settings.profile.country || '',
        pincode: settings.profile.pincode || '',
        logoUrl: storedBranding?.logoUrl ?? ((settings.profile as any).logoUrl || ''),
        showLogoInSidebar: storedBranding?.showLogoInSidebar ?? true,
        showLogoInLogin: storedBranding?.showLogoInLogin ?? true,
        sidebarLogoHeight: storedBranding?.sidebarLogoHeight ?? 42,
        sidebarLogoObjectFit: storedBranding?.sidebarLogoObjectFit ?? 'contain',
        sidebarLogoBg: storedBranding?.sidebarLogoBg ?? 'transparent',
        sidebarLogoRadius: storedBranding?.sidebarLogoRadius ?? 6,
      });
    }
  }, [settings, bootstrap?.tenant?.id]);

  const handleFieldChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTriggerLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file size must be less than 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCustomizerImage(dataUrl);
        setCustomizerOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomizerApply = (brandingSettings: {
    logoUrl: string;
    showLogoInSidebar: boolean;
    sidebarLogoHeight: number;
    sidebarLogoObjectFit: 'contain' | 'cover';
    sidebarLogoBg: string;
    sidebarLogoRadius: number;
  }) => {
    setForm((prev) => ({
      ...prev,
      logoUrl: brandingSettings.logoUrl,
      showLogoInSidebar: brandingSettings.showLogoInSidebar,
      sidebarLogoHeight: brandingSettings.sidebarLogoHeight,
      sidebarLogoObjectFit: brandingSettings.sidebarLogoObjectFit,
      sidebarLogoBg: brandingSettings.sidebarLogoBg,
      sidebarLogoRadius: brandingSettings.sidebarLogoRadius,
    }));

    const tenantId = bootstrap?.tenant?.id || 'default';
    try {
      localStorage.setItem(
        `visiblo_workspace_branding_${tenantId}`,
        JSON.stringify(brandingSettings)
      );
      window.dispatchEvent(new Event('workspace_branding_updated'));
    } catch {
      /* ignore */
    }

    setCustomizerOpen(false);
    toast.success('Sidebar logo branding applied and published live!');
  };

  const handleRemoveLogo = () => {
    setForm((prev) => {
      const next = { ...prev, logoUrl: '' };
      const tenantId = bootstrap?.tenant?.id || 'default';
      try {
        localStorage.setItem(
          `visiblo_workspace_branding_${tenantId}`,
          JSON.stringify({
            logoUrl: '',
            showLogoInSidebar: next.showLogoInSidebar,
            showLogoInLogin: next.showLogoInLogin,
            sidebarLogoHeight: next.sidebarLogoHeight,
            sidebarLogoObjectFit: next.sidebarLogoObjectFit,
            sidebarLogoBg: next.sidebarLogoBg,
            sidebarLogoRadius: next.sidebarLogoRadius,
          })
        );
        window.dispatchEvent(new Event('workspace_branding_updated'));
      } catch {
        /* ignore */
      }
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Logo removed.');
  };

  const handleSaveSettings = async () => {
    if (!form.companyName.trim()) {
      toast.error('Company Name is required.');
      return;
    }

    try {
      setSaving(true);
      const tenantId = bootstrap?.tenant?.id || 'default';
      try {
        localStorage.setItem(
          `visiblo_workspace_branding_${tenantId}`,
          JSON.stringify({
            logoUrl: form.logoUrl || '',
            showLogoInSidebar: form.showLogoInSidebar ?? true,
            showLogoInLogin: form.showLogoInLogin ?? true,
          })
        );
        window.dispatchEvent(new Event('workspace_branding_updated'));
      } catch {
        /* ignore */
      }

      await api.patch('/tenant/runtime/settings', {
        companyName: form.companyName,
        website: form.website,
        primaryEmail: form.primaryEmail,
        primaryPhone: form.primaryPhone,
        industry: form.industry,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
      });

      await reloadBootstrap();
      toast.success('Workspace settings updated successfully!');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to update workspace settings.'
      );
    } finally {
      setSaving(false);
    }
  };

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

  // Tab Form States
  const [localizationForm, setLocalizationForm] = useState({
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-Hour',
    language: 'en-US',
    weekStart: 'Monday',
    numberFormat: 'lakhs',
  });

  const [financialForm, setFinancialForm] = useState({
    currency: 'INR',
    fyStart: 'April',
    gstNumber: '27AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    billingAddress: 'Suite 402, Apex Towers, Andheri East, Mumbai 400069',
    autoInvoice: true,
  });

  const [preferencesForm, setPreferencesForm] = useState({
    defaultLandingPage: '/admin/dashboard',
    sessionTimeout: '60',
    emailNotifications: true,
    pushNotifications: true,
    dailyDigest: true,
    showMapView: true,
    compactTable: false,
  });

  const [securityForm, setSecurityForm] = useState({
    enforce2FA: false,
    passwordMinLength: '8',
    passwordExpiry: 'never',
    maxLoginAttempts: '5',
    ipWhitelist: false,
    geoFenceAttendance: true,
    forceLogoutOnInactivity: false,
  });

  const [integrationsForm, setIntegrationsForm] = useState({
    googleMapsApiKey: '••••••••••••••••••••••••••••••••',
    fcmServerKey: '••••••••••••••••••••••••••••••••',
    whatsappWebhookUrl: 'https://api.visiblo.com/webhooks/whatsapp',
    enableWebhooks: true,
    enableMetaLeadsSync: true,
    enableIndiamartSync: true,
  });

  const saveFullSettings = (key: string, data: any) => {
    try {
      const tenantId = bootstrap?.tenant?.id || 'default';
      const storageKey = `visiblo_workspace_full_settings_${tenantId}`;
      const existing = localStorage.getItem(storageKey);
      const parsed = existing ? JSON.parse(existing) : {};
      parsed[key] = data;
      localStorage.setItem(storageKey, JSON.stringify(parsed));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const tId = bootstrap?.tenant?.id || 'default';
    try {
      const raw = localStorage.getItem(`visiblo_workspace_full_settings_${tId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.localization) setLocalizationForm(parsed.localization);
        if (parsed.financial) setFinancialForm(parsed.financial);
        if (parsed.preferences) setPreferencesForm(parsed.preferences);
        if (parsed.security) setSecurityForm(parsed.security);
        if (parsed.integrations) setIntegrationsForm(parsed.integrations);
      } else if (settings) {
        if (settings.localization) {
          setLocalizationForm((prev) => ({
            ...prev,
            timezone: settings.localization.timezone || 'Asia/Kolkata',
            dateFormat: settings.localization.dateFormat || 'DD/MM/YYYY',
            language: settings.localization.language || 'en-US',
            weekStart: settings.localization.weekStart || 'Monday',
          }));
        }
        if (settings.financial) {
          setFinancialForm((prev) => ({
            ...prev,
            currency: settings.financial.currency || 'INR',
            fyStart: settings.financial.fyStart || 'April',
          }));
        }
      }
    } catch {
      /* ignore */
    }
  }, [settings, bootstrap?.tenant?.id]);

  const handleSaveLocalization = (updated: typeof localizationForm) => {
    setLocalizationForm(updated);
    saveFullSettings('localization', updated);
    toast.success('Localization settings updated successfully!');
  };

  const handleSaveFinancial = (updated: typeof financialForm) => {
    setFinancialForm(updated);
    saveFullSettings('financial', updated);
    toast.success('Business & financial settings updated successfully!');
  };

  const handleSavePreferences = (updated: typeof preferencesForm) => {
    setPreferencesForm(updated);
    saveFullSettings('preferences', updated);
    toast.success('Workspace preferences updated successfully!');
  };

  const handleSaveSecurity = (updated: typeof securityForm) => {
    setSecurityForm(updated);
    saveFullSettings('security', updated);
    toast.success('Security & governance policies updated successfully!');
  };

  const handleSaveIntegrations = (updated: typeof integrationsForm) => {
    setIntegrationsForm(updated);
    saveFullSettings('integrations', updated);
    toast.success('Integration settings updated successfully!');
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoFileChange}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* Sidebar Logo Live Customizer Modal */}
      <SidebarLogoCustomizerModal
        isOpen={customizerOpen}
        imageUrl={customizerImage || form.logoUrl}
        initialSettings={{
          showLogoInSidebar: form.showLogoInSidebar,
          sidebarLogoHeight: form.sidebarLogoHeight,
          sidebarLogoObjectFit: form.sidebarLogoObjectFit,
          sidebarLogoBg: form.sidebarLogoBg,
          sidebarLogoRadius: form.sidebarLogoRadius,
        }}
        onClose={() => setCustomizerOpen(false)}
        onApply={handleCustomizerApply}
      />

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
            Authoritative configuration for tenant <strong className="text-slate-800">{settings.profile.companyName}</strong> ({settings.profile.tenantCode}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Button
              variant="accent"
              size="sm"
              onClick={handleSaveSettings}
              disabled={saving}
              className="gap-1.5 font-bold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Workspace Changes'}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
              <Lock className="h-3.5 w-3.5 text-slate-500" /> Read-Only Access
            </span>
          )}
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
          {activeTab === 'profile' && (
            <ProfileTab
              settings={settings}
              isAdmin={isAdmin}
              form={form}
              onChange={handleFieldChange}
              onSave={handleSaveSettings}
              saving={saving}
              onTriggerLogoUpload={handleTriggerLogoUpload}
              onRemoveLogo={handleRemoveLogo}
              onOpenCustomizer={() => {
                setCustomizerImage(form.logoUrl);
                setCustomizerOpen(true);
              }}
            />
          )}
          {activeTab === 'localization' && (
            <LocalizationTab
              data={localizationForm}
              isAdmin={isAdmin}
              onSave={handleSaveLocalization}
            />
          )}
          {activeTab === 'business-financial' && (
            <BusinessFinancialTab
              data={financialForm}
              isAdmin={isAdmin}
              onSave={handleSaveFinancial}
            />
          )}
          {activeTab === 'preferences' && (
            <PreferencesTab
              data={preferencesForm}
              isAdmin={isAdmin}
              onSave={handleSavePreferences}
            />
          )}
          {activeTab === 'policies-security' && (
            <PoliciesSecurityTab
              data={securityForm}
              isAdmin={isAdmin}
              onSave={handleSaveSecurity}
            />
          )}
          {activeTab === 'integrations' && (
            <IntegrationsTab
              data={integrationsForm}
              isAdmin={isAdmin}
              onSave={handleSaveIntegrations}
            />
          )}
        </div>

        <RightSidebar settings={settings} />
      </div>
    </div>
  );
}
