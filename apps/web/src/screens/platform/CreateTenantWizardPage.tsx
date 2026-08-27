import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Globe,
  UserCheck,
  CreditCard,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldAlert,
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
  Plus,
  ArrowRight,
  Briefcase,
  Smartphone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  BookOpen,
  MessageSquare,
  Bell,
  CheckSquare,
  Search,
  Users,
  Clock,
  Image as ImageIcon,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { DatePicker } from '../../components/ui/DatePicker';
import { TenantCreationProvider, useTenantCreation } from '../../features/platform/tenants/context/TenantCreationContext';

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

  // Pure SVG Flag fallbacks guaranteed to render on Windows
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
    case 'SG':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="10" fill="#ED2939" />
          <rect y="10" width="30" height="10" fill="#FFFFFF" />
          <circle cx="6" cy="5" r="3" fill="#FFFFFF" />
          <circle cx="7.2" cy="5" r="3" fill="#ED2939" />
        </svg>
      );
    case 'AU':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#000085" />
          <rect width="13" height="9" fill="#012169" />
          <path d="M0 0l13 9M13 0L0 9" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M6.5 0v9M0 4.5h13" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M6.5 0v9M0 4.5h13" stroke="#C8102E" strokeWidth="1.2" />
        </svg>
      );
    case 'CA':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#FF0000" />
          <rect x="7.5" width="15" height="20" fill="#FFFFFF" />
          <polygon points="15,4 16,8 19,7 17,10 19,13 16,12 15,16 14,12 11,13 13,10 11,7 14,8" fill="#FF0000" />
        </svg>
      );
    case 'DE':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="6.67" fill="#000000" />
          <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
          <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
        </svg>
      );
    default:
      return (
        <span className="text-xs font-bold text-slate-600">{code}</span>
      );
  }
}

const COUNTRY_CODES = [
  { code: 'IN', flagUrl: 'https://flagcdn.com/24x18/in.png', dial: '+91', name: 'India', length: 10 },
  { code: 'US', flagUrl: 'https://flagcdn.com/24x18/us.png', dial: '+1', name: 'United States', length: 10 },
  { code: 'AE', flagUrl: 'https://flagcdn.com/24x18/ae.png', dial: '+971', name: 'United Arab Emirates', length: 9 },
  { code: 'GB', flagUrl: 'https://flagcdn.com/24x18/gb.png', dial: '+44', name: 'United Kingdom', length: 10 },
  { code: 'SG', flagUrl: 'https://flagcdn.com/24x18/sg.png', dial: '+65', name: 'Singapore', length: 8 },
  { code: 'AU', flagUrl: 'https://flagcdn.com/24x18/au.png', dial: '+61', name: 'Australia', length: 9 },
  { code: 'CA', flagUrl: 'https://flagcdn.com/24x18/ca.png', dial: '+1', name: 'Canada', length: 10 },
  { code: 'DE', flagUrl: 'https://flagcdn.com/24x18/de.png', dial: '+49', name: 'Germany', length: 11 },
];

// Interactive Country Flag & Dial Code PhoneInput Component
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
        {/* Country Flag Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-100/80 border-r border-slate-200 px-2.5 flex items-center text-xs font-bold text-slate-700 gap-1.5 shrink-0 hover:bg-slate-200/80 cursor-pointer transition-colors"
        >
          <CountryFlag code={selectedCountry.code} flagUrl={selectedCountry.flagUrl} />
          <span className="text-slate-800 font-bold">{selectedCountry.dial}</span>
          <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Digit Input */}
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

      {/* Floating Country Selector Card */}
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
      {/* Company Information Card */}
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
            placeholder="https://example.com"
            value={formState.domain ? `https://${formState.domain}` : ''}
            onChange={(e) => updateFormState({ domain: e.target.value })}
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
            value={formState.country || 'India'}
            onChange={(e) => updateFormState({ country: e.target.value })}
            searchable={true}
            options={[
              { value: 'India', label: 'India' },
              { value: 'United States', label: 'United States' },
              { value: 'United Arab Emirates', label: 'United Arab Emirates' },
            ]}
          />
          <Select
            label="State / Province *"
            value="Maharashtra"
            onChange={() => {}}
            searchable={true}
            options={[
              { value: 'Maharashtra', label: 'Maharashtra' },
              { value: 'Delhi', label: 'Delhi' },
              { value: 'Karnataka', label: 'Karnataka' },
            ]}
          />
          <Input
            label="City *"
            placeholder="Enter city"
            value="Mumbai"
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Company Address Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Company Address</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Registered business address of the company.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Address Line 1 *" placeholder="Enter address line 1" value="101, Business Park" onChange={() => {}} />
          <Input label="Address Line 2" placeholder="Enter address line 2" value="Andheri East" onChange={() => {}} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Postal / ZIP Code *" placeholder="Enter postal code" value="400069" onChange={() => {}} />
          <Input label="GST / Tax ID (Optional)" placeholder="Enter GST or Tax ID" value={formState.taxId} onChange={(e) => updateFormState({ taxId: e.target.value })} />
        </div>
      </div>

      {/* Company Settings Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Company Settings</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Basic operational settings for the tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Timezone *"
            value="(GMT+05:30) Asia/Kolkata"
            onChange={() => {}}
            searchable={true}
            options={[{ value: '(GMT+05:30) Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' }]}
          />
          <Select
            label="Currency *"
            value="INR - Indian Rupee (₹)"
            onChange={() => {}}
            searchable={true}
            options={[{ value: 'INR - Indian Rupee (₹)', label: 'INR - Indian Rupee (₹)' }]}
          />
          <Select
            label="Date Format *"
            value="DD MMM YYYY"
            onChange={() => {}}
            searchable={true}
            options={[{ value: 'DD MMM YYYY', label: 'DD MMM YYYY' }]}
          />
          <Select
            label="Financial Year Start *"
            value="April"
            onChange={() => {}}
            searchable={true}
            options={[{ value: 'April', label: 'April' }]}
          />
        </div>
      </div>

      {/* Contact Person Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Contact Person</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Primary point of contact from the company.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input label="Full Name *" placeholder="Enter full name" value={formState.adminFullName} onChange={(e) => updateFormState({ adminFullName: e.target.value })} />
          <Input label="Designation" placeholder="e.g., CEO, Director, Admin" value="CEO" onChange={() => {}} />
          <PhoneInput
            label="Mobile Number *"
            placeholder="Enter mobile number"
            value={formState.adminPhone}
            onChange={(val) => updateFormState({ adminPhone: val })}
          />
          <Input label="Email *" type="email" placeholder="Enter email address" value={formState.adminEmail} onChange={(e) => updateFormState({ adminEmail: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// STEP 2: INDUSTRY & PROFILE
function Step2IndustryProfile() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Industry Information</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Select the primary industry that best describes this tenant's business.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          <div className="sm:col-span-7 space-y-2">
            <Select
              label="Primary Industry *"
              value={formState.industryId || 'Pharma & Healthcare'}
              onChange={(e) => updateFormState({ industryId: e.target.value })}
              searchable={true}
              options={[
                { value: 'Pharma & Healthcare', label: 'Pharma & Healthcare' },
                { value: 'FMCG & Consumer Goods', label: 'FMCG & Consumer Goods' },
                { value: 'Distributors & Wholesalers', label: 'Distributors & Wholesalers' },
                { value: 'Solar & Renewable Energy', label: 'Solar & Renewable Energy' },
                { value: 'Manufacturing & Industrial', label: 'Manufacturing & Industrial' },
              ]}
            />
            <p className="text-[11px] text-slate-400 font-medium">This will help us configure industry-specific defaults for the tenant.</p>
          </div>

          <div className="sm:col-span-5 rounded-sm border border-purple-100 bg-[#F4F0FF] p-5 text-xs space-y-2">
            <p className="font-extrabold text-purple-950 flex items-center gap-1.5 text-xs">
              <Sparkles className="h-4 w-4 text-purple-600" /> Why is this important?
            </p>
            <p className="text-[11px] text-purple-900 font-medium">Industry selection helps us:</p>
            <ul className="space-y-1.5 text-purple-900 font-medium text-[11px]">
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Pre-configure relevant modules</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Set up industry-specific defaults</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Provide better reporting & analytics</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Enable the right workflows</li>
            </ul>
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
            value={formState.companySize || 'Medium (51 - 250 employees)'}
            onChange={(e) => updateFormState({ companySize: e.target.value })}
            searchable={true}
            options={[
              { value: 'Small (1 - 50 employees)', label: 'Small (1 - 50 employees)' },
              { value: 'Medium (51 - 250 employees)', label: 'Medium (51 - 250 employees)' },
              { value: 'Enterprise (250+ employees)', label: 'Enterprise (250+ employees)' },
            ]}
          />
          <Input label="Total Employees *" placeholder="126" value="126" onChange={() => {}} />
          <Input label="Field Users (Approx.) *" placeholder="35" value="35" onChange={() => {}} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Years in Business" value="5 - 10 Years" onChange={() => {}} searchable={true} options={[{ value: '5 - 10 Years', label: '5 - 10 Years' }]} />
          <Select label="Business Model" value="B2B" onChange={() => {}} searchable={true} options={[{ value: 'B2B', label: 'B2B' }, { value: 'B2C', label: 'B2C' }]} />
          <Input label="Number of Branches / Locations" placeholder="6" value="6" onChange={() => {}} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Operating Countries" value="1 selected" onChange={() => {}} searchable={true} options={[{ value: '1 selected', label: '1 selected (India)' }]} />
          <Select label="Preferred Currency *" value="INR - Indian Rupee (₹)" onChange={() => {}} searchable={true} options={[{ value: 'INR - Indian Rupee (₹)', label: 'INR - Indian Rupee (₹)' }]} />
          <Select label="Preferred Language" value="English" onChange={() => {}} searchable={true} options={[{ value: 'English', label: 'English' }]} />
        </div>

        <div>
          <label className="font-bold text-slate-700 text-xs block mb-1">Short Description (Optional)</label>
          <textarea
            rows={3}
            placeholder="Tell us about the company..."
            value="Pharmaceutical distribution and healthcare solutions provider across western India."
            onChange={() => {}}
            className="w-full rounded-md border border-slate-200 bg-[#F8FAFC] p-3 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D1F3D] transition-all"
          />
          <span className="text-[10px] text-slate-400 font-semibold block text-right mt-1">67 / 200</span>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Operational Profile</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Operational preferences and compliance information.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Working Timezone *" value="(GMT+05:30) Asia/Kolkata" onChange={() => {}} searchable={true} options={[{ value: '(GMT+05:30) Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' }]} />
          <Select label="Financial Year Start *" value="April" onChange={() => {}} searchable={true} options={[{ value: 'April', label: 'April' }]} />
          <Select label="Week Start Day *" value="Monday" onChange={() => {}} searchable={true} options={[{ value: 'Monday', label: 'Monday' }]} />
        </div>
      </div>
    </div>
  );
}

// STEP 3: ADMINISTRATOR
function Step3Administrator() {
  const { formState, updateFormState } = useTenantCreation();
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(true);

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Primary Administrator</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Add the primary administrator who will be the main point of contact for this tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Full Name *" placeholder="Enter full name" value={formState.adminFullName} onChange={(e) => updateFormState({ adminFullName: e.target.value })} />
          <Input label="Email Address *" type="email" placeholder="Enter email address" value={formState.adminEmail} onChange={(e) => updateFormState({ adminEmail: e.target.value })} />
          <PhoneInput
            label="Mobile Number *"
            placeholder="Enter mobile number"
            value={formState.adminPhone}
            onChange={(val) => updateFormState({ adminPhone: val })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Designation / Job Title *" placeholder="e.g., CEO, Admin Head" value="CEO" onChange={() => {}} />
          <Select label="Department" value="Administration" onChange={() => {}} searchable={true} options={[{ value: 'Administration', label: 'Administration' }]} />
          <PhoneInput
            label="Phone Number"
            placeholder="Enter phone number"
            value={formState.adminPhone}
            onChange={() => {}}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Preferred Language *" value="English" onChange={() => {}} searchable={true} options={[{ value: 'English', label: 'English' }]} />
          <Select label="Time Zone *" value="(GMT+05:30) Asia/Kolkata" onChange={() => {}} searchable={true} options={[{ value: '(GMT+05:30) Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' }]} />
          <Input label="Communication Email" type="email" placeholder="Enter communication email" value="rahul.sharma@sunrisehealthcare.com" onChange={() => {}} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Username *</label>
            <div className="flex rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden h-10 focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <span className="bg-slate-100 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-500">@</span>
              <input type="text" placeholder="Enter username" value="rahul.sharma@sunrisehealthcare.com" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">This will be used to login to the platform.</p>
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Set Temporary Password *</label>
            <div className="flex rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden h-10 relative focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <input type={showPassword ? 'text' : 'password'} value="••••••••••••" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Confirm Password *</label>
            <div className="flex rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden h-10 relative focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <input type={showPassword ? 'text' : 'password'} value="••••••••••••" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Administrator Permissions Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Administrator Permissions</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Configure initial access level for the primary administrator.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          <div className="sm:col-span-4">
            <Select label="Role *" value="Tenant Owner" onChange={() => {}} searchable={true} options={[{ value: 'Tenant Owner', label: 'Tenant Owner' }]} />
          </div>

          <div className="sm:col-span-5 rounded-sm border border-purple-100 bg-[#F4F0FF] p-4 text-xs space-y-2">
            <p className="font-extrabold text-purple-950 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-purple-600" /> Tenant Owner will have:
            </p>
            <ul className="space-y-1 text-purple-900 font-medium text-[11px]">
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Full access to tenant workspace</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Manage users, roles and permissions</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Configure settings and modules</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> View billing and subscription details</li>
            </ul>
          </div>

          <div className="sm:col-span-3 rounded-sm border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Checkbox
                checked={enable2FA}
                onChange={(val) => setEnable2FA(val)}
                label={
                  <span className="font-extrabold text-[#0D1F3D] text-xs flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-indigo-600" /> Enable 2FA
                  </span>
                }
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-snug">Require two-factor authentication for this administrator account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// STEP 4: PLAN & SUBSCRIPTION
function Step4PlanSubscription() {
  const { formState, updateFormState } = useTenantCreation();

  const plansList = [
    { id: 'starter', name: 'Starter', price: '₹4,999', priceYear: '₹59,988 / year', subtitle: 'For small teams getting started', features: ['Up to 10 Users', 'Core Modules', '5 GB Storage', 'Email Support', 'Standard Reports'] },
    { id: 'growth', name: 'Growth', price: '₹14,999', priceYear: '₹1,79,988 / year', subtitle: 'For growing businesses', features: ['Up to 50 Users', 'Most Modules', '50 GB Storage', 'Priority Support', 'Advanced Reports'] },
    { id: 'professional', name: 'Professional', price: '₹29,999', priceYear: '₹3,59,988 / year', recommended: true, subtitle: 'For established organizations', features: ['Up to 150 Users', 'All Modules & Features', '200 GB Storage', 'Priority Support + SLA', 'Advanced Reports & Dashboards'] },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', priceYear: 'Contact Sales', subtitle: 'For large enterprises', features: ['Unlimited Users', 'All Modules & Features', 'Unlimited Storage', 'Dedicated Support + SLA', 'Custom Reports & Integrations'] },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Choose Plan</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Select a subscription plan and configure billing details for this tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {plansList.map((plan) => {
            const isSelected = formState.planId === plan.id || (plan.id === 'professional' && !formState.planId);
            return (
              <div
                key={plan.id}
                onClick={() => updateFormState({ planId: plan.id })}
                className={`relative rounded-sm border p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute right-3 top-3 rounded-full bg-purple-100 px-2.5 py-0.5 text-[9px] font-extrabold text-purple-700">
                    Recommended
                  </span>
                )}
                <p className="text-base font-extrabold text-[#0D1F3D]">{plan.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mb-3">{plan.subtitle}</p>

                <p className="text-2xl font-extrabold text-[#0D1F3D]">
                  {plan.price} <span className="text-xs font-normal text-slate-400">/ month</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mb-4">{plan.priceYear}</p>

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

      {/* Subscription & Provisioning Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Subscription & Provisioning</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Select label="Billing Cycle" value="Yearly (Save 17%)" onChange={() => {}} searchable={true} options={[{ value: 'Yearly (Save 17%)', label: 'Yearly (Save 17%)' }]} />
            <Input label="Seat / User Limit" placeholder="150" value="150" onChange={() => {}} />
            <Input label="Storage Limit" placeholder="200 GB" value="200 GB" onChange={() => {}} />
            <DatePicker label="Subscription Start Date *" value="2026-05-24" onChange={() => {}} />
          </div>

          <div className="space-y-3">
            <label className="font-bold text-slate-700 text-xs block">Provisioning Type</label>
            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input type="radio" name="prov" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Free Trial</p>
                  <p className="text-[10px] text-slate-400 font-normal">Start with a free trial. No payment required today.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-indigo-600 bg-indigo-50/40 cursor-pointer">
                <input type="radio" name="prov" defaultChecked />
                <div>
                  <p className="font-bold text-indigo-950">Payment Required</p>
                  <p className="text-[10px] text-indigo-800 font-normal">Payment is required to activate the subscription.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input type="radio" name="prov" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Invoice / Offline Payment</p>
                  <p className="text-[10px] text-slate-400 font-normal">You will record payment received outside the platform.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-bold text-slate-700 text-xs block">Payment Collection</label>
            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-indigo-600 bg-indigo-50/40 cursor-pointer">
                <input type="radio" name="pay" defaultChecked />
                <div>
                  <p className="font-bold text-indigo-950">Send Checkout Link to Customer</p>
                  <p className="text-[10px] text-indigo-800 font-normal">We will send a secure payment link to the billing contact.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input type="radio" name="pay" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Record Confirmed Offline Payment</p>
                  <p className="text-[10px] text-slate-400 font-normal">I will confirm payment has been received offline.</p>
                </div>
              </label>
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

  const [modulesList, setModulesList] = useState([
    { code: 'core_crm', name: 'Core CRM & Lead Management', desc: 'Lead capture, pipeline stages, lead assignment & auto-routing.', tag: 'Core Included', price: 'Included', checked: true, icon: <Briefcase className="h-4 w-4 text-indigo-600" /> },
    { code: 'field_visits', name: 'GPS Field Visit Tracking', desc: 'Geofenced check-ins, route map playback, visit proof attachments.', tag: 'Core Included', price: 'Included', checked: true, icon: <MapPin className="h-4 w-4 text-emerald-600" /> },
    { code: 'demo_scheduler', name: 'Demo & Presentation Suite', desc: 'Product demo scheduling, collateral playback, client sign-off.', tag: 'Add-on', price: '₹499 / mo', checked: true, icon: <FileText className="h-4 w-4 text-purple-600" /> },
    { code: 'order_management', name: 'Field Order Booking & Invoicing', desc: 'Product catalog, primary/secondary order booking, tax invoice PDF.', tag: 'Add-on', price: '₹799 / mo', checked: true, icon: <CreditCard className="h-4 w-4 text-blue-600" /> },
    { code: 'attendance_plus', name: 'Face AI & Geofence Attendance', desc: 'Selfie biometric check-in, late arrival penalty rules, muster roll.', tag: 'Add-on', price: '₹399 / mo', checked: true, icon: <Clock className="h-4 w-4 text-amber-600" /> },
    { code: 'payroll_engine', name: 'Field Executive Payroll & Payslips', desc: 'Salary calculations, TA/DA allowances, incentive payouts, PDF payslip.', tag: 'Add-on', price: '₹999 / mo', checked: false, icon: <BarChart3 className="h-4 w-4 text-emerald-600" /> },
    { code: 'whatsapp_automation', name: 'WhatsApp & Meta Lead Sync', desc: 'Official WhatsApp Business API integration, auto-reply bots.', tag: 'Add-on', price: '₹1,299 / mo', checked: true, icon: <MessageSquare className="h-4 w-4 text-cyan-600" /> },
    { code: 'ai_copilot', name: 'AI Sales Copilot & Target Coach', desc: 'AI recommended next best action, churn prediction, automated summary.', tag: 'Add-on', price: '₹1,499 / mo', checked: false, icon: <Zap className="h-4 w-4 text-purple-600" /> },
  ]);

  const toggleModule = (idx: number) => {
    const updated = [...modulesList];
    // Core modules remain enabled
    if (updated[idx].tag === 'Core Included') return;
    updated[idx].checked = !updated[idx].checked;
    setModulesList(updated);
  };

  const enabledCount = modulesList.filter((m) => m.checked).length;

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Enable Modules & Features</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Select the platform modules to activate for this tenant workspace.</p>
          </div>
          <div className="rounded-sm bg-[#F4F0FF] px-3.5 py-1.5 text-xs text-purple-900 font-semibold border border-purple-100 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-purple-600" /> You can activate or modify tenant modules anytime from tenant settings.
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-[#0D1F3D] tracking-wide mb-3">Platform Modules</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {modulesList.map((mod, idx) => (
              <div
                key={mod.code}
                onClick={() => toggleModule(idx)}
                className={`rounded-sm border p-4 space-y-3 flex flex-col justify-between transition-all cursor-pointer ${
                  mod.checked
                    ? 'border-[#0D1F3D] bg-slate-50/70 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white border border-slate-200 shadow-2xs">
                      {mod.icon}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={mod.checked} onChange={() => toggleModule(idx)} />
                    </div>
                  </div>
                  <p className="text-xs font-extrabold text-[#0D1F3D] mb-1">{mod.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug">{mod.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                  <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold border ${
                    mod.tag === 'Core Included'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {mod.tag}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-700">{mod.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
          <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
            <span>Core Modules: <strong className="text-[#0D1F3D]">2 / 2 Active</strong></span>
            <span>Add-on Modules: <strong className="text-[#0D1F3D]">{enabledCount - 2} / 6 Active</strong></span>
          </div>
          <span className="rounded-sm bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-700 border border-purple-200">
            Total Active Modules: {enabledCount} / 8
          </span>
        </div>
      </div>
    </div>
  );
}

// STEP 6: REVIEW & CONFIRM
function Step6ReviewConfirm({ onNavigateStep }: { onNavigateStep: (step: number) => void }) {
  const { formState } = useTenantCreation();

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#0D1F3D]">Review & Confirm</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Please review all details before creating the tenant. You can go back and edit any section if needed.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700">
          <Download className="h-4 w-4 text-slate-400" /> Download Summary
        </Button>
      </div>

      {/* 2x2 Grid for Steps 1-4 */}
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
              <span className="font-extrabold text-[#0D1F3D]">{formState.companyName || 'Sunrise Healthcare Pvt Ltd'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Email</span>
              <span className="font-semibold text-slate-700">{formState.billingContactEmail || 'info@sunrisehealthcare.com'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Legal Name</span>
              <span className="font-semibold text-slate-700">{formState.legalEntityName || 'Sunrise Healthcare Private Limited'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Phone</span>
              <span className="font-semibold text-slate-700">{formState.adminPhone ? `+91 ${formState.adminPhone}` : '+91 98765 43210'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Tenant Code</span>
              <span className="font-mono font-bold text-slate-800">{formState.slug ? `SRHC-${formState.slug.toUpperCase()}` : 'SRHC-TNT'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Country</span>
              <span className="font-semibold text-slate-700">{formState.country || 'India'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Website</span>
              <span className="font-semibold text-slate-700 break-all">{formState.domain ? `https://${formState.domain}` : 'https://sunrisehealthcare.com'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">City</span>
              <span className="font-semibold text-slate-700">Mumbai, Maharashtra</span>
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
              <span className="text-slate-400 text-[11px] block mb-0.5">Industry</span>
              <span className="font-extrabold text-[#0D1F3D]">{formState.industryId || 'Pharma & Healthcare'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Operating Countries</span>
              <span className="font-semibold text-slate-700">India</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Business Size</span>
              <span className="font-semibold text-slate-700">{formState.companySize || 'Medium (51 - 250 employees)'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Number of Branches / Locations</span>
              <span className="font-semibold text-slate-700">6</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Years in Business</span>
              <span className="font-semibold text-slate-700">5 - 10 Years</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Preferred Currency</span>
              <span className="font-semibold text-slate-700">INR - Indian Rupee (₹)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Business Model</span>
              <span className="font-semibold text-slate-700">B2B</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Preferred Language</span>
              <span className="font-semibold text-slate-700">English</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-100">
              <span className="text-slate-400 text-[11px] block mb-0.5">Short Description</span>
              <span className="font-medium text-slate-600 text-[11px]">Pharmaceutical distribution and healthcare solutions provider across western India.</span>
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
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Administrator</h4>
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
              <span className="text-slate-400 text-[11px] block mb-0.5">Full Name</span>
              <span className="font-extrabold text-[#0D1F3D]">{formState.adminFullName || 'Rahul Sharma'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Email</span>
              <span className="font-semibold text-slate-700">{formState.adminEmail || 'rahul.sharma@sunrisehealthcare.com'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Username</span>
              <span className="font-semibold text-slate-700">{formState.adminEmail || 'rahul.sharma@sunrisehealthcare.com'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Phone</span>
              <span className="font-semibold text-slate-700">{formState.adminPhone ? `+91 ${formState.adminPhone}` : '+91 98765 43210'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Designation</span>
              <span className="font-semibold text-slate-700">CEO</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Time Zone</span>
              <span className="font-semibold text-slate-700">(GMT+05:30) Asia/Kolkata</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Department</span>
              <span className="font-semibold text-slate-700">Administration</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Language</span>
              <span className="font-semibold text-slate-700">English</span>
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
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Plan & Subscription</h4>
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
              <span className="text-slate-400 text-[11px] block mb-0.5">Plan</span>
              <span className="font-extrabold text-[#0D1F3D]">Professional (Yearly)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Subscription Start Date</span>
              <span className="font-semibold text-slate-700">24 May 2025</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Billing Cycle</span>
              <span className="font-semibold text-slate-700">Yearly</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Auto Renew</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 text-[10px]">
                <Check className="h-3 w-3" /> Enabled
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Users / Seats Limit</span>
              <span className="font-semibold text-slate-700">150</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Trial Period</span>
              <span className="font-semibold text-slate-700">0 Days</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Storage Limit</span>
              <span className="font-semibold text-slate-700">200 GB</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">Grace Period</span>
              <span className="font-semibold text-slate-700">7 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Card 5: Modules */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
              <Layers className="h-4 w-4" />
            </span>
            <h4 className="text-sm font-extrabold text-[#0D1F3D]">Modules</h4>
          </div>
          <button
            type="button"
            onClick={() => onNavigateStep(5)}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <p className="font-extrabold text-[#0D1F3D] mb-2.5">Core Modules (5)</p>
            <ul className="space-y-2 font-medium text-slate-700">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Jobs & Work Management</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Field Workforce</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Attendance & Time Tracking</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Forms & Surveys</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Photos & Documents</li>
            </ul>
          </div>

          <div>
            <p className="font-extrabold text-[#0D1F3D] mb-2.5">Advanced Modules (4)</p>
            <ul className="space-y-2 font-medium text-slate-700">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Reports & Analytics</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Task Management</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Notifications</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Chat & Messaging</li>
            </ul>
          </div>

          <div>
            <p className="font-extrabold text-[#0D1F3D] mb-2.5">Integrations (1)</p>
            <ul className="space-y-2 font-medium text-slate-700">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> GPS & Location Tracking</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
          <span className="text-xs font-bold text-slate-600">Total Enabled Modules</span>
          <span className="rounded-sm bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-700 border border-purple-200">
            10 Modules
          </span>
        </div>
      </div>

      {/* Full Width Card 6: Subscription Cost (Yearly) */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 font-bold">
            <CreditCard className="h-4 w-4" />
          </span>
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">Subscription Cost (Yearly)</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Plan Amount</span>
            <span className="font-extrabold text-[#0D1F3D]">₹3,59,988</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Taxes (18%)</span>
            <span className="font-extrabold text-[#0D1F3D]">₹64,798</span>
          </div>

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#0D1F3D]">Total (Yearly)</span>
            <span className="text-xl font-extrabold text-indigo-600">₹4,24,786</span>
          </div>
        </div>

        <div className="rounded-sm bg-emerald-50 p-3 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>All amounts are in INR. Taxes are calculated as per applicable rates.</span>
        </div>
      </div>
    </div>
  );
}

// MAIN WIZARD PAGE
export function CreateTenantWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { formState, saveDraft, submitTenant } = useTenantCreation();

  const handleNext = () => {
    if (currentStep === 1 && !formState.companyName) {
      toast.error('Please enter company name to continue');
      return;
    }
    setCurrentStep(Math.min(6, currentStep + 1));
  };

  const handleFinish = async () => {
    const created = await submitTenant();
    toast.success(`Tenant ${created.companyName} created successfully!`);
    navigate('/platform/tenants');
  };

  const stepsList = [
    { num: 1, label: 'Company Details', desc: 'Basic company information' },
    { num: 2, label: 'Industry & Profile', desc: 'Industry and business profile' },
    { num: 3, label: 'Administrator', desc: 'Primary admin details' },
    { num: 4, label: 'Plan & Subscription', desc: 'Choose plan and limits' },
    { num: 5, label: 'Modules', desc: 'Enable modules' },
    { num: 6, label: 'Review & Confirm', desc: 'Review and create tenant' },
  ];

  return (
    <TenantCreationProvider>
      <div className="space-y-6 font-sans pb-16">
        {/* Page Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Create Tenant</h1>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Layers className="h-4 w-4" />
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Set up a new tenant workspace on the Smart Field Work SaaS platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/platform/tenants')} className="font-bold text-slate-700">
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={async () => { await saveDraft(); toast.success('Saved as draft'); }} className="gap-2 font-bold shadow-xs">
              <Save className="h-4 w-4" /> Save as Draft
            </Button>
          </div>
        </div>

        {/* 6 Step Progress Tracker Bar */}
        <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;

              return (
                <div
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
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

        {/* Step Content Layout + Right Summary Card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            {currentStep === 1 && <Step1CompanyDetails />}
            {currentStep === 2 && <Step2IndustryProfile />}
            {currentStep === 3 && <Step3Administrator />}
            {currentStep === 4 && <Step4PlanSubscription />}
            {currentStep === 5 && <Step5Modules />}
            {currentStep === 6 && <Step6ReviewConfirm onNavigateStep={(step) => setCurrentStep(step)} />}

            {/* Bottom Action Navigation Footer */}
            <div className="flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/platform/tenants')}
                className="font-bold text-slate-700"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  className="gap-2 font-bold text-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                {currentStep < 6 ? (
                  <Button variant="accent" size="sm" onClick={handleNext} className="gap-2 font-extrabold shadow-xs px-6">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="accent" size="sm" onClick={handleFinish} className="gap-2 font-extrabold shadow-xs px-6">
                    <CheckCircle className="h-4 w-4" /> Create Tenant
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Live Summary Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-sans">
              <h3 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
                Tenant Creation Summary
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-bold border border-purple-100"><Building2 className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Company</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.companyName || 'Sunrise Healthcare Pvt Ltd'}</p>
                    </div>
                  </div>
                  {currentStep === 6 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-3 w-3" /></span>
                  ) : (
                    <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => setCurrentStep(1)} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 font-bold border border-emerald-100"><Globe className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Industry</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.industryId || 'Pharma & Healthcare'}</p>
                    </div>
                  </div>
                  {currentStep === 6 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-3 w-3" /></span>
                  ) : (
                    <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => setCurrentStep(2)} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-50 text-blue-600 font-bold border border-blue-100"><User className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Administrator</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.adminFullName || 'Rahul Sharma'}</p>
                    </div>
                  </div>
                  {currentStep === 6 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-3 w-3" /></span>
                  ) : (
                    <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => setCurrentStep(3)} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-50 text-amber-600 font-bold border border-amber-100"><CreditCard className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Plan & Subscription</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.planId || 'Professional (Yearly)'}</p>
                    </div>
                  </div>
                  {currentStep === 6 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-3 w-3" /></span>
                  ) : (
                    <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => setCurrentStep(4)} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-bold border border-purple-100"><Layers className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Modules</p>
                      <p className="text-[11px] text-slate-500 font-medium">10 modules selected</p>
                    </div>
                  </div>
                  {currentStep === 6 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-3 w-3" /></span>
                  ) : (
                    <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => setCurrentStep(5)} />
                  )}
                </div>

                {currentStep === 6 && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 font-bold border border-indigo-100"><Shield className="h-4 w-4" /></span>
                      <div>
                        <p className="font-extrabold text-[#0D1F3D]">Review & Confirm</p>
                        <p className="text-[11px] text-slate-500 font-medium">Ready to create</p>
                      </div>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-extrabold text-[10px]">6</span>
                  </div>
                )}
              </div>

              {/* Ready to create tenant? box */}
              <div className="rounded-sm bg-[#F4F0FF] p-5 border border-purple-100 space-y-3">
                <p className="font-extrabold text-purple-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" /> {currentStep === 6 ? 'Ready to create tenant?' : 'What happens next?'}
                </p>
                <p className="text-[11px] text-purple-900 font-medium">
                  {currentStep === 6
                    ? 'Once you create the tenant, the administrator will receive an email with workspace access details.'
                    : 'After creating the tenant, you will be able to:'}
                </p>
                <ul className="space-y-1.5 text-[11px] text-purple-900 font-medium">
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Tenant workspace will be provisioned</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Administrator will be notified via email</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> You can start onboarding users</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> You can manage settings anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TenantCreationProvider>
  );
}
