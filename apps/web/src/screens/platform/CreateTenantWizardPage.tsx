import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { TenantCreationProvider, useTenantCreation } from '../../features/platform/tenants/context/TenantCreationContext';

// Helper for Phone Number Inputs (Digit-only enforcement per Section 1 Rule 1)
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and edit keys: Backspace, Delete, Tab, Arrows
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    // Block non-numeric keys
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(digitsOnly);
  };

  return (
    <div className="w-full space-y-1.5 font-sans">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="flex h-11 w-full rounded-md border border-slate-200 bg-[#F8FAFC] overflow-hidden focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
        <div className="bg-slate-100/80 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-700 gap-1.5 shrink-0 select-none">
          <span className="text-sm">🇮🇳</span>
          <span className="text-slate-800">+91 ▾</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          placeholder={placeholder}
          value={value}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent placeholder-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

// STEP 1: COMPANY DETAILS
function Step1CompanyDetails() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6 font-sans">
      {/* Company Information Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
            <label className="font-bold text-slate-700 text-xs block mb-1.5">Tenant Code *</label>
            <div className="flex rounded-md border border-slate-200 bg-[#F8FAFC] overflow-hidden h-11 focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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

          <div className="sm:col-span-5 rounded-xl border border-purple-100 bg-[#F4F0FF] p-5 text-xs space-y-2">
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

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
            <label className="font-bold text-slate-700 text-xs block mb-1.5">Username *</label>
            <div className="flex rounded-md border border-slate-200 bg-[#F8FAFC] overflow-hidden h-11 focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <span className="bg-slate-100 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-500">@</span>
              <input type="text" placeholder="Enter username" value="rahul.sharma@sunrisehealthcare.com" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">This will be used to login to the platform.</p>
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1.5">Set Temporary Password *</label>
            <div className="flex rounded-md border border-slate-200 bg-[#F8FAFC] overflow-hidden h-11 relative focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <input type={showPassword ? 'text' : 'password'} value="••••••••••••" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1.5">Confirm Password *</label>
            <div className="flex rounded-md border border-slate-200 bg-[#F8FAFC] overflow-hidden h-11 relative focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
              <input type={showPassword ? 'text' : 'password'} value="••••••••••••" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Administrator Permissions Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Administrator Permissions</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Configure initial access level for the primary administrator.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          <div className="sm:col-span-4">
            <Select label="Role *" value="Tenant Owner" onChange={() => {}} searchable={true} options={[{ value: 'Tenant Owner', label: 'Tenant Owner' }]} />
          </div>

          <div className="sm:col-span-5 rounded-xl border border-purple-100 bg-[#F4F0FF] p-4 text-xs space-y-2">
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

          <div className="sm:col-span-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0D1F3D] text-xs flex items-center gap-1.5"><Lock className="h-4 w-4 text-indigo-600" /> Enable 2FA</span>
              <span className="h-5 w-9 rounded-full bg-indigo-600 inline-flex items-center justify-end px-0.5 cursor-pointer"><span className="h-4 w-4 rounded-full bg-white shadow-xs" /></span>
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
                className={`relative rounded-xl border p-5 cursor-pointer transition-all ${
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Subscription & Provisioning</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Select label="Billing Cycle" value="Yearly (Save 17%)" onChange={() => {}} searchable={true} options={[{ value: 'Yearly (Save 17%)', label: 'Yearly (Save 17%)' }]} />
            <Input label="Seat / User Limit" placeholder="150" value="150" onChange={() => {}} />
            <Input label="Storage Limit" placeholder="200 GB" value="200 GB" onChange={() => {}} />
            <Input label="Subscription Start Date" placeholder="24 May 2026" value="24 May 2026" onChange={() => {}} />
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

  const [coreList, setCoreList] = useState([
    { code: 'JOBS', name: 'Jobs & Work Management', desc: 'Create, assign and track jobs from scheduling to completion.', tag: 'Included', checked: true },
    { code: 'FIELD', name: 'Field Workforce', desc: 'Manage field executives, attendance and locations.', tag: 'Included', checked: true },
    { code: 'ATTENDANCE', name: 'Attendance & Time Tracking', desc: 'Track check-in/check-out and working hours.', tag: 'Included', checked: true },
    { code: 'FORMS', name: 'Forms & Surveys', desc: 'Build custom forms, surveys and inspections.', tag: 'Included', checked: true },
    { code: 'PHOTOS', name: 'Photos & Documents', desc: 'Capture and manage photos, documents and files.', tag: 'Included', checked: true },
  ]);

  const [advList, setAdvList] = useState([
    { code: 'REPORTS', name: 'Reports & Analytics', desc: 'Real-time reports, dashboards and data insights.', tag: 'Included', checked: true },
    { code: 'TASKS', name: 'Task Management', desc: 'Create tasks, set due dates and track progress.', tag: 'Included', checked: true },
    { code: 'NOTIF', name: 'Notifications', desc: 'In-app, email and SMS notifications.', tag: 'Included', checked: true },
    { code: 'CHAT', name: 'Chat & Messaging', desc: 'Team communication and real-time messaging.', tag: 'Add-on', checked: false },
    { code: 'KB', name: 'Knowledge Base', desc: 'Create and manage help articles and guides.', tag: 'Add-on', checked: false },
  ]);

  const toggleCore = (idx: number) => {
    const updated = [...coreList];
    updated[idx].checked = !updated[idx].checked;
    setCoreList(updated);
  };

  const toggleAdv = (idx: number) => {
    const updated = [...advList];
    updated[idx].checked = !updated[idx].checked;
    setAdvList(updated);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Enable Modules & Features</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Select the modules and features you want to enable for this tenant.</p>
          </div>
          <div className="rounded-xl bg-[#F4F0FF] px-4 py-2 text-xs text-purple-900 font-semibold border border-purple-100 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-purple-600" /> You can enable or disable modules anytime from the tenant settings.
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider mb-3">Core Modules</h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {coreList.map((mod, idx) => (
                <div key={mod.code} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-[#0D1F3D]">{mod.name}</span>
                      <Checkbox checked={mod.checked} onChange={() => toggleCore(idx)} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug">{mod.desc}</p>
                  </div>
                  <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 self-start">
                    {mod.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider mb-3">Advanced Modules</h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {advList.map((mod, idx) => (
                <div key={mod.code} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-[#0D1F3D]">{mod.name}</span>
                      <Checkbox checked={mod.checked} onChange={() => toggleAdv(idx)} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug">{mod.desc}</p>
                  </div>
                  <span className={`inline-flex rounded-md px-2.5 py-0.5 text-[10px] font-bold self-start border ${
                    mod.tag === 'Included' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {mod.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
          <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
            <span>Core Modules: <strong className="text-[#0D1F3D]">5 / 5 Enabled</strong></span>
            <span>Advanced Modules: <strong className="text-[#0D1F3D]">4 / 5 Enabled</strong></span>
            <span>Integrations: <strong className="text-[#0D1F3D]">1 / 5 Enabled</strong></span>
          </div>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-700">
            Total Enabled: 10 Modules
          </span>
        </div>
      </div>
    </div>
  );
}

// STEP 6: REVIEW & CONFIRM
function Step6ReviewConfirm() {
  const { formState } = useTenantCreation();

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#0D1F3D]">Review & Confirm</h3>
          <p className="text-xs text-slate-500 font-medium">Please review all details before creating the tenant. You can go back and edit any section if needed.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700">
          <Download className="h-4 w-4 text-slate-400" /> Download Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider">Company Details</h4>
            <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"><Edit2 className="h-3 w-3" /> Edit</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <div><span className="text-slate-400 text-[11px] block">Company Name</span><span className="font-bold text-[#0D1F3D]">{formState.companyName || 'Sunrise Healthcare Pvt Ltd'}</span></div>
            <div><span className="text-slate-400 text-[11px] block">Email</span><span className="font-semibold text-slate-700">info@sunrisehealthcare.com</span></div>
            <div><span className="text-slate-400 text-[11px] block">Tenant Code</span><span className="font-mono font-bold text-slate-800">SRHC-TNT</span></div>
            <div><span className="text-slate-400 text-[11px] block">Country</span><span className="font-semibold text-slate-700">India</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider">Primary Administrator</h4>
            <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"><Edit2 className="h-3 w-3" /> Edit</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <div><span className="text-slate-400 text-[11px] block">Full Name</span><span className="font-bold text-[#0D1F3D]">{formState.adminFullName || 'Rahul Sharma'}</span></div>
            <div><span className="text-slate-400 text-[11px] block">Email</span><span className="font-semibold text-slate-700">{formState.adminEmail || 'rahul.sharma@sunrisehealthcare.com'}</span></div>
          </div>
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;

              return (
                <div
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                    isActive ? 'bg-indigo-50/60 border-b-2 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isDone ? <Check className="h-4 w-4" /> : step.num}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-extrabold truncate ${isActive ? 'text-indigo-900' : isDone ? 'text-slate-800' : 'text-slate-500'}`}>
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
            {currentStep === 6 && <Step6ReviewConfirm />}

            {/* Bottom Action Navigation Footer */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-sans">
              <h3 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
                Tenant Creation Summary
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 font-bold"><Building2 className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Company</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.companyName || 'Sunrise Healthcare Pvt Ltd'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold"><Globe className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Industry</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.industryId || 'Pharma & Healthcare'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold"><User className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Administrator</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.adminFullName || 'Rahul Sharma'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-bold"><CreditCard className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Plan & Subscription</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.planId || 'Professional (Yearly)'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>
              </div>

              {/* What happens next? card */}
              <div className="rounded-xl bg-[#F4F0FF] p-5 border border-purple-100 space-y-3">
                <p className="font-extrabold text-purple-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" /> What happens next?
                </p>
                <p className="text-[11px] text-purple-900 font-medium">After creating the tenant, you will be able to:</p>
                <ul className="space-y-1.5 text-[11px] text-purple-900 font-medium">
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Invite team members</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Configure workspace settings</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Manage modules and features</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Monitor usage and billing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TenantCreationProvider>
  );
}
