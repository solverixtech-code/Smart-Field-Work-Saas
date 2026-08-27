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
  CheckSquare,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { TenantCreationProvider, useTenantCreation } from '../../features/platform/tenants/context/TenantCreationContext';

// STEP 1: COMPANY DETAILS
function Step1CompanyDetails() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6 font-sans">
      {/* Company Information Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Information</h3>
          <p className="text-xs text-slate-500 font-medium">Basic information about the company/organization.</p>
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
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10">
              <span className="bg-slate-100 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-600">
                SFW-TNT-
              </span>
              <input
                type="text"
                placeholder="Enter code"
                value={formState.slug}
                onChange={(e) => updateFormState({ slug: e.target.value, domain: `${e.target.value}.smartfieldwork.com` })}
                className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
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
            placeholder="admin@company.com"
            value={formState.billingContactEmail}
            onChange={(e) => updateFormState({ billingContactEmail: e.target.value })}
          />
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Phone *</label>
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10">
              <div className="bg-slate-50 border-r border-slate-200 px-2.5 flex items-center text-xs font-bold text-slate-700 gap-1">
                <span>🇮🇳</span> <span>+91 ▾</span>
              </div>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formState.adminPhone}
                onChange={(e) => updateFormState({ adminPhone: e.target.value })}
                className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Country *"
            value={formState.country}
            onChange={(e) => updateFormState({ country: e.target.value })}
            searchable={false}
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
            searchable={false}
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
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Address</h3>
          <p className="text-xs text-slate-500 font-medium">Registered business address of the company.</p>
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
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Settings</h3>
          <p className="text-xs text-slate-500 font-medium">Basic operational settings for the tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Timezone *"
            value="(GMT+05:30) Asia/Kolkata"
            onChange={() => {}}
            searchable={false}
            options={[{ value: '(GMT+05:30) Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' }]}
          />
          <Select
            label="Currency *"
            value="INR - Indian Rupee (₹)"
            onChange={() => {}}
            searchable={false}
            options={[{ value: 'INR - Indian Rupee (₹)', label: 'INR - Indian Rupee (₹)' }]}
          />
          <Select
            label="Date Format *"
            value="DD MMM YYYY"
            onChange={() => {}}
            searchable={false}
            options={[{ value: 'DD MMM YYYY', label: 'DD MMM YYYY' }]}
          />
          <Select
            label="Financial Year Start *"
            value="April"
            onChange={() => {}}
            searchable={false}
            options={[{ value: 'April', label: 'April' }]}
          />
        </div>
      </div>

      {/* Contact Person Card */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Contact Person</h3>
          <p className="text-xs text-slate-500 font-medium">Primary point of contact from the company.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input label="Full Name *" placeholder="Enter full name" value={formState.adminFullName} onChange={(e) => updateFormState({ adminFullName: e.target.value })} />
          <Input label="Designation" placeholder="e.g., CEO, Director, Admin" value="CEO" onChange={() => {}} />
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Mobile Number *</label>
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10">
              <div className="bg-slate-50 border-r border-slate-200 px-2 flex items-center text-xs font-bold text-slate-700 gap-1">
                <span>🇮🇳</span> <span>+91 ▾</span>
              </div>
              <input type="tel" placeholder="Enter mobile number" value={formState.adminPhone} onChange={(e) => updateFormState({ adminPhone: e.target.value })} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none" />
            </div>
          </div>
          <Input label="Email *" placeholder="Enter email address" value={formState.adminEmail} onChange={(e) => updateFormState({ adminEmail: e.target.value })} />
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
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Industry Information</h3>
          <p className="text-xs text-slate-500 font-medium">Select the primary industry that best describes this tenant's business.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          <div className="sm:col-span-7 space-y-2">
            <Select
              label="Primary Industry *"
              value={formState.industryId || 'Pharma & Healthcare'}
              onChange={(e) => updateFormState({ industryId: e.target.value })}
              searchable={false}
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

          <div className="sm:col-span-5 rounded-sm border border-indigo-100 bg-indigo-50/50 p-4 text-xs space-y-2">
            <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" /> Why is this important?
            </p>
            <ul className="space-y-1.5 text-indigo-900 font-medium text-[11px]">
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Pre-configure relevant modules</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Set up industry-specific defaults</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Provide better reporting & analytics</li>
              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Enable the right workflows</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Business Profile</h3>
          <p className="text-xs text-slate-500 font-medium">Tell us more about the business to help customize the workspace.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Business Size *"
            value={formState.companySize || 'Medium (51 - 250 employees)'}
            onChange={(e) => updateFormState({ companySize: e.target.value })}
            searchable={false}
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
          <Select label="Years in Business" value="5 - 10 Years" onChange={() => {}} searchable={false} options={[{ value: '5 - 10 Years', label: '5 - 10 Years' }]} />
          <Select label="Business Model" value="B2B" onChange={() => {}} searchable={false} options={[{ value: 'B2B', label: 'B2B' }, { value: 'B2C', label: 'B2C' }]} />
          <Input label="Number of Branches / Locations" placeholder="6" value="6" onChange={() => {}} />
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
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Primary Administrator</h3>
          <p className="text-xs text-slate-500 font-medium">Add the primary administrator who will be the main point of contact for this tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Full Name *" placeholder="Enter full name" value={formState.adminFullName} onChange={(e) => updateFormState({ adminFullName: e.target.value })} />
          <Input label="Email Address *" placeholder="Enter email address" value={formState.adminEmail} onChange={(e) => updateFormState({ adminEmail: e.target.value })} />
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Mobile Number *</label>
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10">
              <div className="bg-slate-50 border-r border-slate-200 px-2 flex items-center text-xs font-bold text-slate-700 gap-1">
                <span>🇮🇳</span> <span>+91 ▾</span>
              </div>
              <input type="tel" placeholder="Enter mobile number" value={formState.adminPhone} onChange={(e) => updateFormState({ adminPhone: e.target.value })} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Designation / Job Title *" placeholder="e.g., CEO, Admin Head" value="CEO" onChange={() => {}} />
          <Select label="Department" value="Administration" onChange={() => {}} searchable={false} options={[{ value: 'Administration', label: 'Administration' }]} />
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Phone Number</label>
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10">
              <div className="bg-slate-50 border-r border-slate-200 px-2 flex items-center text-xs font-bold text-slate-700 gap-1">
                <span>🇮🇳</span> <span>+91 ▾</span>
              </div>
              <input type="tel" placeholder="Enter phone number" value={formState.adminPhone} onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Username *</label>
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10">
              <span className="bg-slate-100 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-500">@</span>
              <input type="text" placeholder="Enter username" value="rahul.sharma@sunrisehealthcare.com" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">This will be used to login to the platform.</p>
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Set Temporary Password *</label>
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10 relative">
              <input type={showPassword ? 'text' : 'password'} value="••••••••••••" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 text-xs block mb-1">Confirm Password *</label>
            <div className="flex rounded-sm border border-slate-200 bg-white overflow-hidden h-10 relative">
              <input type={showPassword ? 'text' : 'password'} value="••••••••••••" onChange={() => {}} className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] focus:outline-none pr-8" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

  const plansList = [
    { id: 'starter', name: 'Starter', price: '₹4,999', subtitle: 'For small teams getting started', features: ['Up to 10 Users', 'Core Modules', '5 GB Storage', 'Email Support', 'Standard Reports'] },
    { id: 'growth', name: 'Growth', price: '₹14,999', subtitle: 'For growing businesses', features: ['Up to 50 Users', 'Most Modules', '50 GB Storage', 'Priority Support', 'Advanced Reports'] },
    { id: 'professional', name: 'Professional', price: '₹29,999', recommended: true, subtitle: 'For established organizations', features: ['Up to 150 Users', 'All Modules', '200 GB Storage', 'Priority Support + SLA', 'Advanced Reports & Dashboards'] },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', subtitle: 'For large enterprises', features: ['Unlimited Users', 'All Modules & Features', 'Unlimited Storage', 'Dedicated Support + SLA', 'Custom Reports & Integrations'] },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Choose Plan</h3>
          <p className="text-xs text-slate-500 font-medium">Select a subscription plan and configure billing details for this tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {plansList.map((plan) => {
            const isSelected = formState.planId === plan.id || (plan.id === 'professional' && !formState.planId);
            return (
              <div
                key={plan.id}
                onClick={() => updateFormState({ planId: plan.id })}
                className={`relative rounded-sm border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute right-3 top-3 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-extrabold text-indigo-700">
                    Recommended
                  </span>
                )}
                <p className="text-sm font-extrabold text-[#0D1F3D]">{plan.name}</p>
                <p className="text-[11px] text-slate-500 font-medium mb-3">{plan.subtitle}</p>

                <p className="text-xl font-extrabold text-[#0D1F3D]">
                  {plan.price} <span className="text-xs font-normal text-slate-400">/ month</span>
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-600">
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
    </div>
  );
}

// STEP 5: MODULES
function Step5Modules() {
  const { formState, updateFormState } = useTenantCreation();

  const coreModules = [
    { code: 'JOBS', name: 'Jobs & Work Management', desc: 'Create, assign and track jobs from scheduling to completion.', tag: 'Included' },
    { code: 'FIELD', name: 'Field Workforce', desc: 'Manage field executives, attendance and locations.', tag: 'Included' },
    { code: 'ATTENDANCE', name: 'Attendance & Time Tracking', desc: 'Track check-in/check-out and working hours.', tag: 'Included' },
    { code: 'FORMS', name: 'Forms & Surveys', desc: 'Build custom forms, surveys and inspections.', tag: 'Included' },
    { code: 'PHOTOS', name: 'Photos & Documents', desc: 'Capture and manage photos, documents and files.', tag: 'Included' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Enable Modules & Features</h3>
            <p className="text-xs text-slate-500 font-medium">Select the modules and features you want to enable for this tenant.</p>
          </div>
          <div className="rounded-sm bg-purple-50 px-3 py-1.5 text-xs text-purple-900 font-semibold border border-purple-100 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-purple-600" /> You can enable or disable modules anytime from the tenant settings.
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider mb-3">Core Modules</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {coreModules.map((mod) => (
              <div key={mod.code} className="rounded-sm border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0D1F3D]">{mod.name}</span>
                  <Checkbox checked={true} onChange={() => {}} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">{mod.desc}</p>
                <span className="inline-flex rounded-xs bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {mod.tag}
                </span>
              </div>
            ))}
          </div>
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
        <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
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

        <div className="rounded-sm border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
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

        {/* 6 Step Progress Tracker Bar (Matching Create Tenant (Step 1).png 100%) */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;

              return (
                <div
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-3 p-2 rounded-sm cursor-pointer transition ${
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

          {/* Right Live Summary Panel (Matching Create Tenant (Step 1).png 100%) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-sans">
              <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
                Tenant Creation Summary
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-bold"><Building2 className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Company</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.companyName || 'Not provided'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 font-bold"><Globe className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Industry</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.industryId || 'Not selected'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-50 text-blue-600 font-bold"><User className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Administrator</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.adminFullName || 'Not provided'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-amber-50 text-amber-600 font-bold"><CreditCard className="h-4 w-4" /></span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Plan & Subscription</p>
                      <p className="text-[11px] text-slate-500 font-medium">{formState.planId || 'Not selected'}</p>
                    </div>
                  </div>
                  <Edit2 className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                </div>
              </div>

              {/* What happens next? card */}
              <div className="rounded-sm bg-purple-50/60 p-4 border border-purple-100 space-y-2">
                <p className="font-extrabold text-purple-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" /> What happens next?
                </p>
                <p className="text-[11px] text-purple-900 font-medium">After creating the tenant, you will be able to:</p>
                <ul className="space-y-1 text-[11px] text-purple-900 font-medium">
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
