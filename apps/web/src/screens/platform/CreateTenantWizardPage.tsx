import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Globe,
  CreditCard,
  Check,
  CheckCircle,
  Info,
  Layers,
  Edit2,
  Download,
  Eye,
  EyeOff,
  User,
  Shield,
  FileText,
  Lock,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  BarChart3,
  MessageSquare,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  Save,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { DatePicker } from '../../components/ui/DatePicker';
import { TenantCreationProvider, useTenantCreation } from '../../features/platform/tenants/context/TenantCreationContext';
import { PLATFORM_INDUSTRIES, PLATFORM_PLANS, PLATFORM_MODULES } from '../../features/platform/tenants/fixtures/platform.fixtures';
import { tenantService } from '../../features/platform/tenants/services/tenant.service';
import { Tenant, ProvisioningType, PaymentCollectionMethod } from '../../features/platform/tenants/types/platform.types';
import { calculatePlanPrice } from '../../features/platform/tenants/utils/cost-calculation.utils';

const STEP_PARAM_MAP: Record<string, number> = {
  company: 1,
  industry: 2,
  administrator: 3,
  subscription: 4,
  modules: 5,
  review: 6,
};

const STEP_NUM_MAP: Record<number, string> = {
  1: 'company',
  2: 'industry',
  3: 'administrator',
  4: 'subscription',
  5: 'modules',
  6: 'review',
};

function CountryFlag({ code, flagUrl }: { code: string; flagUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError && flagUrl) {
    return (
      <img
        src={flagUrl}
        alt={code}
        onError={() => setImgError(true)}
        className="w-5 h-3.5 object-cover rounded-xs border border-slate-200/80 shadow-2xs shrink-0"
      />
    );
  }

  switch (code) {
    case 'IN':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="6.67" fill="#FF9933" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#138808" />
          <circle cx="15" cy="10" r="2.2" fill="none" stroke="#000080" strokeWidth="0.8" />
        </svg>
      );
    case 'US':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#B22234" />
          <path d="M0 3h30M0 6.2h30M0 9.4h30M0 12.6h30M0 15.8h30M0 19h30" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect width="12" height="10.8" fill="#3C3B6E" />
        </svg>
      );
    case 'AE':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="6.67" fill="#00732F" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#000000" />
          <rect width="7.5" height="20" fill="#FF0000" />
        </svg>
      );
    case 'GB':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.5" />
          <path d="M15 0v20M0 10h30" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3" />
        </svg>
      );
    default:
      return <span className="text-xs font-bold text-slate-600">{code}</span>;
  }
}

const COUNTRY_CODES = [
  { code: 'IN', flagUrl: 'https://flagcdn.com/24x18/in.png', dial: '+91', name: 'India', length: 10 },
  { code: 'US', flagUrl: 'https://flagcdn.com/24x18/us.png', dial: '+1', name: 'United States', length: 10 },
  { code: 'AE', flagUrl: 'https://flagcdn.com/24x18/ae.png', dial: '+971', name: 'United Arab Emirates', length: 9 },
  { code: 'GB', flagUrl: 'https://flagcdn.com/24x18/gb.png', dial: '+44', name: 'United Kingdom', length: 10 },
];

function PhoneInput({
  label,
  value,
  onChange,
  placeholder = 'Enter mobile number',
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.length);
    onChange(digitsOnly);
  };

  return (
    <div className="w-full space-y-1 text-left font-sans relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-700">{label}</label>

      <div className="flex h-10 w-full rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-100/80 border-r border-slate-200 px-2.5 flex items-center text-xs font-bold text-slate-700 gap-1.5 shrink-0 hover:bg-slate-200/80 cursor-pointer transition-colors"
        >
          <CountryFlag code={selectedCountry.code} flagUrl={selectedCountry.flagUrl} />
          <span className="text-slate-800 font-bold">{selectedCountry.dial}</span>
          <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={selectedCountry.length}
          placeholder={placeholder}
          value={value}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent placeholder-slate-400 focus:outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-[9999] w-60 rounded-sm border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95">
          <div className="px-2 py-1 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-extrabold text-[#0D1F3D] uppercase tracking-wider">Select Country Code</p>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCountry(c);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCountry.code === c.code
                    ? 'bg-[#0D1F3D] text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CountryFlag code={c.code} flagUrl={c.flagUrl} />
                  <span>{c.name}</span>
                </div>
                <span className="font-mono text-[11px] opacity-80">{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// STEP 1: COMPANY DETAILS
function Step1CompanyDetails() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Company Information</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Basic information about the company/organization.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Company Name *"
            placeholder="Enter company name"
            value={formState.companyName}
            onChange={(e) => updateFormState({ companyName: e.target.value })}
          />
          <Input
            label="Legal Name *"
            placeholder="Enter legal name"
            value={formState.legalEntityName}
            onChange={(e) => updateFormState({ legalEntityName: e.target.value })}
          />
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Tenant Code *</label>
            <div className="flex rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden h-10 focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <span className="bg-slate-100 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-600">
                SFW-TNT-
              </span>
              <input
                type="text"
                placeholder="Enter code"
                value={formState.slug}
                onChange={(e) => updateFormState({ slug: e.target.value, domain: `${e.target.value}.smartfieldwork.com` })}
                className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Unique code for this tenant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Website"
            placeholder="www.example.com"
            value={formState.website}
            onChange={(e) => updateFormState({ website: e.target.value })}
          />
          <Input
            label="Email *"
            type="email"
            placeholder="admin@company.com"
            value={formState.billingContactEmail}
            onChange={(e) => updateFormState({ billingContactEmail: e.target.value })}
          />
          <PhoneInput
            label="Phone *"
            placeholder="Enter phone number"
            value={formState.adminPhone}
            onChange={(val) => updateFormState({ adminPhone: val })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Country *"
            value={formState.country}
            onChange={(e) => updateFormState({ country: e.target.value })}
            searchable={true}
            options={[
              { value: 'India', label: 'India' },
              { value: 'United States', label: 'United States' },
              { value: 'United Arab Emirates', label: 'United Arab Emirates' },
              { value: 'United Kingdom', label: 'United Kingdom' },
              { value: 'Singapore', label: 'Singapore' },
              { value: 'Australia', label: 'Australia' },
            ]}
          />
          <Select
            label="State / Province *"
            value={formState.state}
            onChange={(e) => updateFormState({ state: e.target.value })}
            searchable={true}
            options={[
              { value: 'Maharashtra', label: 'Maharashtra' },
              { value: 'Delhi', label: 'Delhi' },
              { value: 'Karnataka', label: 'Karnataka' },
              { value: 'Tamil Nadu', label: 'Tamil Nadu' },
              { value: 'Gujarat', label: 'Gujarat' },
              { value: 'Rajasthan', label: 'Rajasthan' },
            ]}
          />
          <Input
            label="City *"
            placeholder="Enter city"
            value={formState.city}
            onChange={(e) => updateFormState({ city: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Company Address</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Registered business address of the company.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Address Line 1 *" placeholder="Enter address line 1" value={formState.addressLine1} onChange={(e) => updateFormState({ addressLine1: e.target.value })} />
          <Input label="Address Line 2" placeholder="Enter address line 2" value={formState.addressLine2} onChange={(e) => updateFormState({ addressLine2: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Postal / ZIP Code *" placeholder="Enter postal code" value={formState.pincode} onChange={(e) => updateFormState({ pincode: e.target.value })} />
          <Input label="GST / Tax ID (Optional)" placeholder="Enter GST or Tax ID" value={formState.taxId} onChange={(e) => updateFormState({ taxId: e.target.value })} />
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Company Settings</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Basic operational settings for the tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Timezone *"
            value={formState.timezone}
            onChange={(e) => updateFormState({ timezone: e.target.value })}
            searchable={true}
            options={[
              { value: '(GMT+05:30) Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' },
              { value: '(GMT+00:00) UTC', label: '(GMT+00:00) UTC' },
              { value: '(GMT-05:00) America/New_York', label: '(GMT-05:00) America/New_York' },
              { value: '(GMT+01:00) Europe/London', label: '(GMT+01:00) Europe/London' },
              { value: '(GMT+08:00) Asia/Singapore', label: '(GMT+08:00) Asia/Singapore' },
            ]}
          />
          <Select
            label="Currency *"
            value={formState.currency}
            onChange={(e) => updateFormState({ currency: e.target.value })}
            searchable={true}
            options={[
              { value: 'INR - Indian Rupee (₹)', label: 'INR - Indian Rupee (₹)' },
              { value: 'USD - US Dollar ($)', label: 'USD - US Dollar ($)' },
              { value: 'EUR - Euro (€)', label: 'EUR - Euro (€)' },
              { value: 'GBP - British Pound (£)', label: 'GBP - British Pound (£)' },
            ]}
          />
          <Select
            label="Date Format *"
            value={formState.dateFormat}
            onChange={(e) => updateFormState({ dateFormat: e.target.value })}
            searchable={true}
            options={[
              { value: 'DD MMM YYYY', label: 'DD MMM YYYY (27 Aug 2026)' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (08/27/2026)' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-08-27)' },
            ]}
          />
          <Select
            label="Financial Year Start *"
            value={formState.financialYearStart}
            onChange={(e) => updateFormState({ financialYearStart: e.target.value })}
            searchable={true}
            options={[
              { value: 'January', label: 'January' },
              { value: 'April', label: 'April' },
              { value: 'July', label: 'July' },
              { value: 'October', label: 'October' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// STEP 2: INDUSTRY & PROFILE
function Step2IndustryProfile() {
  const { formState, updateFormState } = useTenantCreation();

  const industryOptions = PLATFORM_INDUSTRIES.map((ind) => ({
    value: ind.id,
    label: ind.label,
  }));

  const handleIndustryChange = (selectedId: string) => {
    const selectedInd = PLATFORM_INDUSTRIES.find((i) => i.id === selectedId);
    let updatedModules = [...formState.selectedModuleCodes];

    if (selectedInd && selectedInd.defaultModules) {
      // Merge industry default modules into current selection
      updatedModules = Array.from(new Set([...updatedModules, ...selectedInd.defaultModules]));
    }

    updateFormState({
      industryId: selectedId,
      selectedModuleCodes: updatedModules,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Industry Information</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Select the primary industry from the 25+ canonical industry registry.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          <div className="sm:col-span-7 space-y-2">
            <Select
              label="Primary Industry *"
              value={formState.industryId}
              onChange={(e) => handleIndustryChange(e.target.value)}
              searchable={true}
              options={industryOptions}
            />
            <p className="text-[11px] text-slate-400 font-medium">Selected ID: <strong className="font-mono text-slate-700">{formState.industryId}</strong></p>
          </div>

          <div className="sm:col-span-5 rounded-sm border border-purple-100 bg-[#F4F0FF] p-5 text-xs space-y-2">
            <p className="font-extrabold text-purple-950 flex items-center gap-1.5 text-xs">
              <Sparkles className="h-4 w-4 text-purple-600" /> Industry Defaults Pre-configured
            </p>
            <p className="text-[11px] text-purple-900 font-medium">Selecting an industry automatically recommends tailored field modules while honoring plan restrictions.</p>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Business Profile</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tell us more about the business to help customize the workspace.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Business Size *"
            value={formState.companySize}
            onChange={(e) => updateFormState({ companySize: e.target.value })}
            searchable={true}
            options={[
              { value: 'Small (1 - 50 employees)', label: 'Small (1 - 50 employees)' },
              { value: 'Medium (51 - 250 employees)', label: 'Medium (51 - 250 employees)' },
              { value: 'Enterprise (250+ employees)', label: 'Enterprise (250+ employees)' },
            ]}
          />
          <Input label="Total Employees *" placeholder="Enter total employees" value={formState.totalEmployees} onChange={(e) => updateFormState({ totalEmployees: e.target.value })} />
          <Input label="Field Users (Approx.) *" placeholder="Enter field users count" value={formState.fieldUsers} onChange={(e) => updateFormState({ fieldUsers: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Years in Business"
            value={formState.yearsInBusiness}
            onChange={(e) => updateFormState({ yearsInBusiness: e.target.value })}
            searchable={true}
            options={[
              { value: 'Less than 1 Year', label: 'Less than 1 Year' },
              { value: '1 - 3 Years', label: '1 - 3 Years' },
              { value: '3 - 5 Years', label: '3 - 5 Years' },
              { value: '5 - 10 Years', label: '5 - 10 Years' },
              { value: '10+ Years', label: '10+ Years' },
            ]}
          />
          <Select
            label="Business Model"
            value={formState.businessModel}
            onChange={(e) => updateFormState({ businessModel: e.target.value })}
            searchable={true}
            options={[
              { value: 'B2B', label: 'B2B' },
              { value: 'B2C', label: 'B2C' },
              { value: 'B2B2C', label: 'B2B2C' },
              { value: 'D2C', label: 'D2C' },
            ]}
          />
          <Input label="Number of Branches / Locations" placeholder="Enter number of branches" value={formState.branchCount} onChange={(e) => updateFormState({ branchCount: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// STEP 3: ADMINISTRATOR
function Step3Administrator() {
  const { formState, updateFormState } = useTenantCreation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Primary Administrator</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Add the primary administrator who will be the main point of contact for this tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Full Name *" placeholder="Enter full name" value={formState.adminFullName} onChange={(e) => updateFormState({ adminFullName: e.target.value })} />
          <Input label="Email Address *" type="email" placeholder="Enter email address" value={formState.adminEmail} onChange={(e) => updateFormState({ adminEmail: e.target.value, adminUsername: e.target.value })} />
          <PhoneInput
            label="Mobile Number *"
            placeholder="Enter mobile number"
            value={formState.adminPhone}
            onChange={(val) => updateFormState({ adminPhone: val })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Designation / Job Title *" placeholder="e.g., CEO, Admin Head" value={formState.adminDesignation} onChange={(e) => updateFormState({ adminDesignation: e.target.value })} />
          <Select
            label="Department"
            value={formState.adminDepartment}
            onChange={(e) => updateFormState({ adminDepartment: e.target.value })}
            searchable={true}
            options={[
              { value: 'Administration', label: 'Administration' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Operations', label: 'Operations' },
              { value: 'IT', label: 'IT' },
            ]}
          />
          <Input label="Username *" placeholder="Username" value={formState.adminUsername || formState.adminEmail} onChange={(e) => updateFormState({ adminUsername: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Temporary Password (Optional)</label>
            <div className="flex rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden h-10 relative focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter temporary password" value={formState.adminPassword} onChange={(e) => updateFormState({ adminPassword: e.target.value })} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Confirm Password</label>
            <div className="flex rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden h-10 relative focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" value={formState.adminConfirmPassword} onChange={(e) => updateFormState({ adminConfirmPassword: e.target.value })} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// STEP 4: PLAN & SUBSCRIPTION
function Step4PlanSubscription() {
  const { formState, updateFormState } = useTenantCreation();

  const handlePlanSelect = (planId: string) => {
    const selectedPlan = PLATFORM_PLANS.find((p) => p.id === planId);
    let updatedModules = [...formState.selectedModuleCodes];

    if (selectedPlan) {
      // Ensure plan mandatory included modules are always present
      updatedModules = Array.from(new Set([...updatedModules, ...selectedPlan.includedModules]));
    }

    updateFormState({
      planId,
      selectedModuleCodes: updatedModules,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Choose Canonical Subscription Plan</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Select a subscription plan from the canonical PLATFORM_PLANS catalog.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {PLATFORM_PLANS.map((plan) => {
            const isSelected = formState.planId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`relative rounded-sm border p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {plan.code === 'PROFESSIONAL' && (
                  <span className="absolute right-3 top-3 rounded-full bg-purple-100 px-2.5 py-0.5 text-[9px] font-extrabold text-purple-700">
                    Recommended
                  </span>
                )}
                <p className="text-base font-extrabold text-[#0D1F3D]">{plan.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mb-3 font-mono">ID: {plan.id}</p>

                <p className="text-2xl font-extrabold text-[#0D1F3D]">
                  ₹{plan.monthlyPricePerUser.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ user / mo</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mb-4">Min Users: {plan.minUsers}</p>

                <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Subscription & Provisioning Policy</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Select
              label="Billing Cycle"
              value={formState.billingCycle}
              onChange={(e) => updateFormState({ billingCycle: e.target.value })}
              searchable={true}
              options={[
                { value: 'Monthly', label: 'Monthly' },
                { value: 'Yearly (Save 17%)', label: 'Yearly (Save 17%)' },
              ]}
            />
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">User Licenses Count *</label>
              <input
                type="number"
                min={1}
                value={formState.userLicensesCount}
                onChange={(e) => updateFormState({ userLicensesCount: parseInt(e.target.value, 10) || 1 })}
                className="w-full h-10 px-3 text-xs font-bold text-[#0D1F3D] bg-[#F8FAFC] border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>
            <DatePicker label="Subscription Start Date *" value={formState.subscriptionStartDate} onChange={(val) => updateFormState({ subscriptionStartDate: val })} />
          </div>

          {/* Provisioning Type Radio Cards - Including Enterprise Contract */}
          <div className="space-y-3">
            <label className="font-bold text-slate-700 text-xs block">Provisioning Type</label>
            <div className="space-y-2 text-xs font-semibold">
              {([
                { value: 'Free Trial' as ProvisioningType, title: 'Free Trial', desc: 'Start 14-day trial. Status = Trial, MRR = 0.' },
                { value: 'Payment Required' as ProvisioningType, title: 'Payment Required', desc: 'Status = Pending Payment, MRR = 0 until activated.' },
                { value: 'Invoice / Offline Payment' as ProvisioningType, title: 'Invoice / Offline Payment', desc: 'Offline payment tracking.' },
                { value: 'Enterprise Contract' as ProvisioningType, title: 'Enterprise Contract', desc: 'Status = Pending Payment until billing approval.' },
              ] as const).map((opt) => {
                const isActive = formState.provisioningType === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="prov"
                      checked={isActive}
                      onChange={() => updateFormState({ provisioningType: opt.value })}
                    />
                    <div>
                      <p className={`font-bold ${isActive ? 'text-indigo-950' : 'text-[#0D1F3D]'}`}>{opt.title}</p>
                      <p className={`text-[10px] font-normal ${isActive ? 'text-indigo-800' : 'text-slate-400'}`}>{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-bold text-slate-700 text-xs block">Payment Collection Method</label>
            <div className="space-y-2 text-xs font-semibold">
              {([
                { value: 'Send Checkout Link to Customer' as PaymentCollectionMethod, title: 'Send Checkout Link to Customer', desc: 'Status remains Pending Payment until paid.' },
                { value: 'Record Confirmed Offline Payment' as PaymentCollectionMethod, title: 'Record Confirmed Offline Payment', desc: 'Activates tenant immediately & calculates MRR.' },
              ] as const).map((opt) => {
                const isActive = formState.paymentCollectionMethod === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={isActive}
                      onChange={() => updateFormState({ paymentCollectionMethod: opt.value })}
                    />
                    <div>
                      <p className={`font-bold ${isActive ? 'text-indigo-950' : 'text-[#0D1F3D]'}`}>{opt.title}</p>
                      <p className={`text-[10px] font-normal ${isActive ? 'text-indigo-800' : 'text-slate-400'}`}>{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// STEP 5: MODULES
function Step5Modules() {
  const { formState, updateFormState } = useTenantCreation();
  const selectedPlan = PLATFORM_PLANS.find((p) => p.id === formState.planId) || PLATFORM_PLANS[0];
  const mandatoryCodes = selectedPlan.includedModules || [];

  const toggleModuleCode = (code: string) => {
    // Cannot toggle plan mandatory modules
    if (mandatoryCodes.includes(code)) {
      toast.info(`Module '${code}' is mandatory for the selected plan (${selectedPlan.name})`);
      return;
    }

    const currentSelected = formState.selectedModuleCodes;
    const isSelected = currentSelected.includes(code);
    const updatedCodes = isSelected
      ? currentSelected.filter((c) => c !== code)
      : [...currentSelected, code];

    updateFormState({ selectedModuleCodes: updatedCodes });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Enable Modules & Features</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Select from canonical PLATFORM_MODULES catalog. Plan-mandatory modules are locked.</p>
          </div>
          <div className="rounded-sm bg-[#F4F0FF] px-3.5 py-1.5 text-xs text-purple-900 font-semibold border border-purple-100 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-purple-600" /> Selected Plan: <strong className="font-extrabold">{selectedPlan.name}</strong>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-[#0D1F3D] tracking-wide mb-3">Canonical Platform Modules</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {PLATFORM_MODULES.map((mod) => {
              const isChecked = formState.selectedModuleCodes.includes(mod.code);
              const isMandatory = mandatoryCodes.includes(mod.code);

              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModuleCode(mod.code)}
                  className={`rounded-sm border p-4 space-y-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isChecked
                      ? 'border-[#0D1F3D] bg-slate-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white border border-slate-200 shadow-2xs font-bold text-indigo-600">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isChecked}
                          onChange={() => toggleModuleCode(mod.code)}
                          disabled={isMandatory}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-extrabold text-[#0D1F3D] mb-1">{mod.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug">{mod.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                    <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold border ${
                      isMandatory
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {isMandatory ? 'Plan Mandatory' : mod.category}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-700">
                      {mod.monthlyPrice === 0 ? 'Included' : `₹${mod.monthlyPrice} / mo`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
          <span className="text-xs font-bold text-slate-600">
            Selected Plan Mandatory Modules: <strong className="text-[#0D1F3D]">{mandatoryCodes.length}</strong>
          </span>
          <span className="rounded-sm bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-700 border border-purple-200">
            Total Selected Modules: {formState.selectedModuleCodes.length} / {PLATFORM_MODULES.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// STEP 6: REVIEW & CONFIRM
function Step6ReviewConfirm({ onNavigateStep }: { onNavigateStep: (step: number) => void }) {
  const { formState } = useTenantCreation();

  const selectedIndustry = PLATFORM_INDUSTRIES.find((i) => i.id === formState.industryId) || PLATFORM_INDUSTRIES[0];
  const selectedPlan = PLATFORM_PLANS.find((p) => p.id === formState.planId) || PLATFORM_PLANS[0];

  const priceResult = calculatePlanPrice({
    plan: selectedPlan,
    billingCycle: formState.billingCycle,
    userLicensesCount: formState.userLicensesCount,
  });

  const selectedModuleNames = PLATFORM_MODULES.filter((m) => formState.selectedModuleCodes.includes(m.code)).map(
    (m) => m.name
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#0D1F3D]">Review & Confirm Details</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Please review all configuration fields derived from canonical fixtures before submitting.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Company Details */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 font-bold">
                <Building2 className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Company Details</h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateStep(1)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Company Name</span>
              <span className="font-extrabold text-[#0D1F3D]">{formState.companyName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Legal Entity</span>
              <span className="font-semibold text-slate-700">{formState.legalEntityName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Tenant Code</span>
              <span className="font-mono font-bold text-slate-800">{formState.slug || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Country & City</span>
              <span className="font-semibold text-slate-700">{formState.city ? `${formState.city}, ${formState.country}` : formState.country}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Industry & Profile */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                <Globe className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Industry & Profile</h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateStep(2)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Industry Label</span>
              <span className="font-extrabold text-[#0D1F3D]">{selectedIndustry.label}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Canonical ID</span>
              <span className="font-mono font-bold text-slate-800">{selectedIndustry.id}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Business Size</span>
              <span className="font-semibold text-slate-700">{formState.companySize}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Administrator */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                <User className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Administrator Account</h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateStep(3)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Admin Full Name</span>
              <span className="font-extrabold text-[#0D1F3D]">{formState.adminFullName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Email</span>
              <span className="font-semibold text-slate-700">{formState.adminEmail || '—'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Plan & Subscription */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 font-bold">
                <CreditCard className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Plan & Provisioning</h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateStep(4)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Plan Name</span>
              <span className="font-extrabold text-[#0D1F3D]">{selectedPlan.name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">User Licenses</span>
              <span className="font-semibold text-slate-700">{formState.userLicensesCount} seats</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Provisioning Type</span>
              <span className="font-semibold text-slate-700">{formState.provisioningType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Collection Method</span>
              <span className="font-semibold text-slate-700">{formState.paymentCollectionMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">
            Selected Modules ({formState.selectedModuleCodes.length})
          </h4>
          <button
            type="button"
            onClick={() => onNavigateStep(5)}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {selectedModuleNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-sm bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 border border-slate-200"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" /> {name}
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Subscription Cost Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 font-bold">
            <CreditCard className="h-4 w-4" />
          </span>
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">Estimated Subscription Cost Summary</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Price Per User ({formState.billingCycle})</span>
            <span className="font-extrabold text-[#0D1F3D]">₹{priceResult.pricePerUser.toLocaleString('en-IN')} / mo</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Monthly Total ({formState.userLicensesCount} users)</span>
            <span className="font-extrabold text-[#0D1F3D]">₹{priceResult.monthlyTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Annual Subtotal</span>
            <span className="font-extrabold text-[#0D1F3D]">₹{priceResult.annualTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Estimated Taxes (18%)</span>
            <span className="font-extrabold text-[#0D1F3D]">₹{priceResult.estimatedTax.toLocaleString('en-IN')}</span>
          </div>

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#0D1F3D]">Grand Total</span>
            <span className="text-xl font-extrabold text-indigo-600">₹{priceResult.finalGrandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateTenantWizardInner() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantIdParam = searchParams.get('tenantId');
  const stepParam = searchParams.get('step');
  const isEditMode = Boolean(tenantIdParam);

  const {
    currentStep,
    setCurrentStep,
    formState,
    saveDraft,
    submitTenant,
    loadTenantForEdit,
    isDirty,
    resetForm,
  } = useTenantCreation();

  const [loadingTenant, setLoadingTenant] = useState(false);
  const [tenantNotFound, setTenantNotFound] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Sync step from query param if available
  useEffect(() => {
    if (stepParam && STEP_PARAM_MAP[stepParam]) {
      setCurrentStep(STEP_PARAM_MAP[stepParam]);
    }
  }, [stepParam, setCurrentStep]);

  // If in edit mode, fetch tenant by target ID
  useEffect(() => {
    if (tenantIdParam) {
      setLoadingTenant(true);
      tenantService
        .getTenantById(tenantIdParam)
        .then((found) => {
          if (found) {
            loadTenantForEdit(found);
            setTenantNotFound(false);
          } else {
            setTenantNotFound(true);
          }
        })
        .catch(() => setTenantNotFound(true))
        .finally(() => setLoadingTenant(false));
    }
  }, [tenantIdParam]);

  const updateStepInUrl = (stepNum: number) => {
    setCurrentStep(stepNum);
    const stepName = STEP_NUM_MAP[stepNum] || 'company';
    const newParams: Record<string, string> = { step: stepName };
    if (tenantIdParam) newParams.tenantId = tenantIdParam;
    setSearchParams(newParams);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formState.companyName.trim()) {
        toast.error('Please enter Company Name to continue');
        return;
      }
      if (!formState.slug.trim()) {
        toast.error('Please enter Tenant Code to continue');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formState.industryId) {
        toast.error('Please select an Industry to continue');
        return;
      }
    }

    if (currentStep === 3) {
      if (!formState.adminFullName.trim() || !formState.adminEmail.trim()) {
        toast.error('Please enter Administrator Name and Email to continue');
        return;
      }
      if (formState.adminPassword && formState.adminPassword !== formState.adminConfirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    updateStepInUrl(Math.min(6, currentStep + 1));
  };

  const handleFinish = async () => {
    try {
      const result = await submitTenant();
      toast.success(
        isEditMode
          ? `Tenant '${result?.companyName || formState.companyName}' updated successfully!`
          : `Tenant '${result?.companyName || formState.companyName}' created successfully!`
      );
      resetForm();
      navigate('/platform/tenants');
    } catch {
      toast.error('Failed to save tenant');
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      resetForm();
      navigate('/platform/tenants');
    }
  };

  if (loadingTenant) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans">
        <div className="inline-block animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
        <p className="text-xs font-semibold">Loading tenant details...</p>
      </div>
    );
  }

  if (tenantNotFound) {
    return (
      <div className="p-12 text-center text-slate-700 font-sans max-w-md mx-auto space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-extrabold text-[#0D1F3D]">Edit Target Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">
          This tenant could not be found or may no longer be available for editing.
        </p>
        <Button variant="accent" size="sm" onClick={() => navigate('/platform/tenants')} className="w-full font-bold justify-center">
          Back to All Tenants
        </Button>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: 'Company Details', desc: 'Basic info & code' },
    { num: 2, label: 'Industry & Profile', desc: 'Canonical registry' },
    { num: 3, label: 'Administrator', desc: 'Primary contact' },
    { num: 4, label: 'Plan & Subscription', desc: 'PLATFORM_PLANS' },
    { num: 5, label: 'Modules', desc: 'Module selection' },
    { num: 6, label: 'Review & Confirm', desc: 'Review & submit' },
  ];

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
              {isEditMode ? `Edit Tenant — ${formState.companyName || 'Loading...'}` : 'Create Tenant'}
            </h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {isEditMode
              ? 'Update tenant workspace configuration, subscription plan, administrator, and module entitlements'
              : 'Set up a new tenant workspace on the Smart Field Work SaaS platform'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCancel} className="font-bold text-slate-700">
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={async () => {
              await saveDraft();
              toast.success('Saved as draft');
            }}
            className="gap-2 font-bold shadow-xs"
          >
            <Save className="h-4 w-4" /> Save as Draft
          </Button>
        </div>
      </div>

      {/* 6 Step Stepper Bar */}
      <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;

            return (
              <div
                key={step.num}
                onClick={() => updateStepInUrl(step.num)}
                className={`flex items-center gap-2.5 p-2.5 rounded-sm cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-50 border border-slate-300 shadow-2xs'
                    : isDone
                    ? 'hover:bg-slate-50/80'
                    : 'hover:bg-slate-50/60 opacity-80'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : isActive
                      ? 'bg-[#0D1F3D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : step.num}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs truncate transition-colors ${
                      isActive
                        ? 'font-extrabold text-[#0D1F3D]'
                        : isDone
                        ? 'font-bold text-slate-800'
                        : 'font-semibold text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8 space-y-6">
          {currentStep === 1 && <Step1CompanyDetails />}
          {currentStep === 2 && <Step2IndustryProfile />}
          {currentStep === 3 && <Step3Administrator />}
          {currentStep === 4 && <Step4PlanSubscription />}
          {currentStep === 5 && <Step5Modules />}
          {currentStep === 6 && <Step6ReviewConfirm onNavigateStep={(step) => updateStepInUrl(step)} />}

          {/* Navigation Actions Footer */}
          <div className="flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
            <Button variant="outline" size="sm" onClick={handleCancel} className="font-bold text-slate-700">
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStep === 1}
                onClick={() => updateStepInUrl(Math.max(1, currentStep - 1))}
                className="gap-2 font-bold text-slate-700"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              {currentStep < 6 ? (
                <Button variant="accent" size="sm" onClick={handleNext} className="gap-2 font-extrabold shadow-xs px-6">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleFinish}
                  className="gap-2 font-extrabold shadow-xs px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <CheckCircle className="h-4 w-4" /> {isEditMode ? 'Update Tenant Details' : 'Create Tenant'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Live Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-sans">
            <h3 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Tenant Summary
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-bold border border-purple-100">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Company</p>
                    <p className="text-[11px] text-slate-500 font-medium">{formState.companyName || '—'}</p>
                  </div>
                </div>
                <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => updateStepInUrl(1)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                    <Globe className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Industry</p>
                    <p className="text-[11px] text-slate-500 font-medium">{formState.industryId || 'ind_pharma'}</p>
                  </div>
                </div>
                <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => updateStepInUrl(2)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-50 text-blue-600 font-bold border border-blue-100">
                    <User className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Administrator</p>
                    <p className="text-[11px] text-slate-500 font-medium">{formState.adminFullName || '—'}</p>
                  </div>
                </div>
                <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => updateStepInUrl(3)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-50 text-amber-600 font-bold border border-amber-100">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Plan</p>
                    <p className="text-[11px] text-slate-500 font-medium">{formState.planId}</p>
                  </div>
                </div>
                <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => updateStepInUrl(4)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-bold border border-purple-100">
                    <Layers className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Selected Modules</p>
                    <p className="text-[11px] text-slate-500 font-medium">{formState.selectedModuleCodes.length} modules selected</p>
                  </div>
                </div>
                <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => updateStepInUrl(5)} />
              </div>
            </div>

            <div className="rounded-sm bg-[#F4F0FF] p-4 border border-purple-100 space-y-2">
              <p className="font-extrabold text-purple-950 text-xs flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" /> Canonical Fixtures Guard
              </p>
              <p className="text-[11px] text-purple-900 font-medium leading-relaxed">
                All values originate from canonical PLATFORM_PLANS, PLATFORM_INDUSTRIES, and PLATFORM_MODULES.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 font-sans text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Unsaved Changes</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                You have unsaved changes in the wizard. Are you sure you want to discard them and leave?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 font-bold justify-center"
              >
                Keep Editing
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setShowCancelConfirm(false);
                  resetForm();
                  navigate('/platform/tenants');
                }}
                className="flex-1 font-bold bg-rose-600 hover:bg-rose-700 text-white justify-center"
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CreateTenantWizardPage() {
  return (
    <TenantCreationProvider>
      <CreateTenantWizardInner />
    </TenantCreationProvider>
  );
}
