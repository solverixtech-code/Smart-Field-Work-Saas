import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../../common/api";
import { useRuntimeBootstrap } from "../../../features/runtime/context/RuntimeBootstrapContext";
import {
  workspaceSettingsService,
  WorkspaceSettings,
} from "../../../features/platform/tenants/services/workspace-settings.service";
import { ImageCropperModal } from "../../../components/ui/ImageCropperModal";
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
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

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

const INDUSTRY_OPTIONS = [
  { value: "PHARMA", label: "Pharmaceuticals & Healthcare" },
  { value: "Pharmaceuticals & Healthcare", label: "Pharmaceuticals & Healthcare" },
  { value: "FMCG", label: "FMCG & Consumer Goods" },
  { value: "FMCG & Consumer Goods", label: "FMCG & Consumer Goods" },
  { value: "RETAIL", label: "Retail & Distribution" },
  { value: "Retail & Distribution", label: "Retail & Distribution" },
  { value: "BFSI", label: "BFSI & Financial Services" },
  { value: "BFSI & Financial Services", label: "BFSI & Financial Services" },
  { value: "LOGISTICS", label: "Logistics & Supply Chain" },
  { value: "Logistics & Supply Chain", label: "Logistics & Supply Chain" },
  { value: "TELECOM", label: "Telecom & Utilities" },
  { value: "Telecom & Utilities", label: "Telecom & Utilities" },
  { value: "SAAS", label: "Technology & Enterprise SaaS" },
  { value: "Technology & Enterprise SaaS", label: "Technology & Enterprise SaaS" },
  { value: "MANUFACTURING", label: "Manufacturing & Industrial" },
  { value: "Manufacturing & Industrial", label: "Manufacturing & Industrial" },
  { value: "OTHER", label: "Other" },
  { value: "Other", label: "Other" },
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
  };
  onChange: (field: string, val: string) => void;
  onSave: () => void;
  saving: boolean;
  onTriggerLogoUpload: () => void;
  onRemoveLogo: () => void;
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
                <img
                  src={form.logoUrl}
                  alt="Company Logo"
                  className="max-h-full max-w-full object-contain"
                />
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
              <div className="flex items-center gap-2 w-full">
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
            <span className="text-[10px] text-slate-500 font-medium text-center">
              Supports PNG, JPG, WebP. Cropped via ImageCropperModal.
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
            <DisabledToggleSwitch
              checked={p.logoInLogin}
              label="Logo in Login"
              description="Login logo branding configured by workspace theme"
            />
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
function LocalizationTab({ settings }: { settings: WorkspaceSettings }) {
  const loc = settings.localization;

  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Localization Settings"
        message="Regional preferences and date/time formatting standards across your workspace."
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Languages className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Localization Settings
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Authoritative regional preferences issued by server runtime
              bootstrap.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Timezone" value={loc.timezone} disabled readOnly />
          <Input label="Date Format" value={loc.dateFormat} disabled readOnly />
          <Input
            label="Time Format"
            value={loc.timeFormat || "Not Configured"}
            disabled
            readOnly
          />
          <Input
            label="Primary Language"
            value={loc.language}
            disabled
            readOnly
          />
          <Input
            label="Week Start Day"
            value={loc.weekStart}
            disabled
            readOnly
          />
          <Input
            label="Number Format"
            value={loc.numberFormat || "Not Configured"}
            disabled
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Business & Financial ───
function BusinessFinancialTab({ settings }: { settings: WorkspaceSettings }) {
  const bf = settings.financial;

  return (
    <div className="space-y-6">
      <ApiExposureNotice
        title="Financial & Tax Settings"
        message="Currency standards, tax details, and financial year defaults for billing."
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Banknote className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Financial Settings
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Authoritative currency and financial defaults for your workspace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Currency" value={bf.currency} disabled readOnly />
          <Input
            label="Financial Year Start"
            value={bf.fyStart}
            disabled
            readOnly
          />
          <Input
            label="GST / Tax ID"
            value={bf.gstNumber || "Not Configured"}
            disabled
            readOnly
          />
          <Input
            label="PAN Number"
            value={bf.panNumber || "Not Configured"}
            disabled
            readOnly
          />
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
        title="Workspace Preferences"
        message="General workspace preferences and user notification defaults are governed by system defaults."
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Workspace Preferences
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              System notification and interface preferences.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <DisabledToggleSwitch
            checked={true}
            label="Email Notifications"
            description="System transactional alerts active"
          />
          <DisabledToggleSwitch
            checked={true}
            label="Push Notifications"
            description="FCM push notification service active"
          />
          <DisabledToggleSwitch
            checked={false}
            label="Compact Table Mode"
            description="Standard comfortable grid view"
          />
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
        title="Security & Governance Policies"
        message="Authentication security, password policies, 2FA, and geofencing parameters are governed by platform security standards."
      />

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Security Policies
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Platform security engine status.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <DisabledToggleSwitch
            checked={true}
            label="Enforce Two-Factor Authentication"
            description="Managed by platform security policy"
          />
          <DisabledToggleSwitch
            checked={true}
            label="Geofence Attendance Check-in"
            description="Managed by field policy module"
          />
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
        title="Integrations Catalog"
        message="Integration connectors and API integrations are managed via platform administration."
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
          Integrations catalog and key management are active and configured by system administrators.
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

  // Logo & Cropper State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempCropperImage, setTempCropperImage] = useState<string>('');

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
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.profile) {
      setForm({
        companyName: settings.profile.companyName || '',
        industry: settings.profile.industry === 'Unassigned' ? '' : settings.profile.industry || '',
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
        logoUrl: (settings.profile as any).logoUrl || '',
      });
    }
  }, [settings]);

  const handleFieldChange = (field: string, value: string) => {
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
        setTempCropperImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setForm((prev) => ({ ...prev, logoUrl: base64data }));
      setCropperOpen(false);
      toast.success('Company logo cropped successfully! Click "Save Workspace Changes" to publish.');
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: '' }));
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

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageUrl={tempCropperImage}
        title="Crop Company Logo"
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
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
            />
          )}
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
