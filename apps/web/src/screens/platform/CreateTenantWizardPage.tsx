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
} from 'lucide-react';
import { Button, Input, Select, Checkbox } from '../../components/ui';
import { TenantCreationProvider, useTenantCreation } from '../../features/platform/tenants/context/TenantCreationContext';
import { PLATFORM_INDUSTRIES, PLATFORM_PLANS, PLATFORM_MODULES } from '../../features/platform/tenants/fixtures/platform.fixtures';
import { ProvisioningType, PaymentCollectionMethod } from '../../features/platform/tenants/types/platform.types';

function Step1CompanyDetails() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Information</h3>
        <p className="text-xs text-slate-500 font-medium -mt-3">Basic information about the company/organization.</p>
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
          <Input
            label="Tenant Code *"
            placeholder="Enter code"
            value={formState.slug}
            onChange={(e) => updateFormState({ slug: e.target.value, domain: `${e.target.value}.smartfieldwork.com` })}
          />
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
          <Input
            label="Phone *"
            placeholder="Enter phone number"
            value={formState.adminPhone}
            onChange={(e) => updateFormState({ adminPhone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Country *"
            value={formState.country}
            onChange={(e) => updateFormState({ country: e.target.value })}
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

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Address Line 1 *" placeholder="Enter address line 1" value="101, Business Park" onChange={() => {}} />
          <Input label="Address Line 2" placeholder="Enter address line 2" value="Andheri East" onChange={() => {}} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Postal / ZIP Code *" placeholder="Enter postal code" value="400069" onChange={() => {}} />
          <Input label="GST / Tax ID (Optional)" placeholder="Enter GST or Tax ID" value={formState.taxId} onChange={(e) => updateFormState({ taxId: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function Step2IndustryProfile() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-[#0D1F3D]">Industry Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Primary Industry *"
            value={formState.industryId}
            onChange={(e) => updateFormState({ industryId: e.target.value })}
            options={PLATFORM_INDUSTRIES.map((ind) => ({ value: ind.id, label: ind.label }))}
          />
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1"><Info className="h-3.5 w-3.5 text-blue-600" /> Why is this important?</p>
            <p className="text-blue-700">Pre-configures relevant modules, industry defaults, and reporting metrics for this workspace.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-extrabold text-[#0D1F3D]">Business Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Business Size *"
            value={formState.companySize}
            onChange={(e) => updateFormState({ companySize: e.target.value })}
            options={[
              { value: '1-10 Employees', label: '1-10 Employees' },
              { value: '11-50 Employees', label: '11-50 Employees' },
              { value: '51-250 Employees', label: '51-250 Employees (Medium)' },
              { value: '250+ Employees', label: '250+ Employees (Enterprise)' },
            ]}
          />
          <Input label="Total Employees *" placeholder="e.g. 126" value="126" onChange={() => {}} />
          <Input label="Field Users (Approx.) *" placeholder="e.g. 35" value="35" onChange={() => {}} />
        </div>
      </div>
    </div>
  );
}

function Step3Administrator() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-[#0D1F3D]">Primary Administrator</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Full Name *"
            placeholder="Enter full name"
            value={formState.adminFullName}
            onChange={(e) => updateFormState({ adminFullName: e.target.value })}
          />
          <Input
            label="Email Address *"
            placeholder="Enter email address"
            value={formState.adminEmail}
            onChange={(e) => updateFormState({ adminEmail: e.target.value })}
          />
          <Input
            label="Mobile Number *"
            placeholder="Enter mobile number"
            value={formState.adminPhone}
            onChange={(e) => updateFormState({ adminPhone: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Designation / Job Title *"
            placeholder="e.g. CEO, Admin Head"
            value={formState.adminDesignation}
            onChange={(e) => updateFormState({ adminDesignation: e.target.value })}
          />
          <Select
            label="Department"
            value="Administration"
            onChange={() => {}}
            options={[
              { value: 'Administration', label: 'Administration' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Operations', label: 'Operations' },
            ]}
          />
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            value={formState.adminPhone}
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

function Step4PlanSubscription() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-extrabold text-[#0D1F3D]">Choose Subscription Plan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {PLATFORM_PLANS.map((plan) => {
          const isSelected = formState.planId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => updateFormState({ planId: plan.id })}
              className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-bold text-slate-500 uppercase">{plan.tier}</p>
              <p className="text-lg font-extrabold text-[#0D1F3D] mt-1">{plan.name}</p>
              <p className="text-xl font-extrabold text-blue-600 mt-2">
                ₹{plan.monthlyPricePerUser.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ user / mo</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step5Modules() {
  const { formState, updateFormState } = useTenantCreation();

  const toggleModule = (code: string) => {
    const current = formState.selectedModuleCodes;
    if (current.includes(code)) {
      updateFormState({ selectedModuleCodes: current.filter((c) => c !== code) });
    } else {
      updateFormState({ selectedModuleCodes: [...current, code] });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-extrabold text-[#0D1F3D]">Enable Modules & Features</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLATFORM_MODULES.map((mod) => {
          const isEnabled = formState.selectedModuleCodes.includes(mod.code);
          return (
            <div
              key={mod.id}
              onClick={() => toggleModule(mod.code)}
              className={`rounded-2xl border p-4 cursor-pointer transition ${
                isEnabled ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-200' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0D1F3D]">{mod.name}</span>
                <Checkbox checked={isEnabled} onChange={() => {}} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">{mod.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step6ReviewConfirm() {
  const { formState } = useTenantCreation();

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-extrabold text-[#0D1F3D]">Review Tenant Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Company Information</p>
          <p className="text-sm font-extrabold text-[#0D1F3D]">{formState.companyName}</p>
          <p className="text-xs text-slate-600 font-medium">Domain: https://{formState.slug}.smartfieldwork.com</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Primary Admin</p>
          <p className="text-sm font-extrabold text-[#0D1F3D]">{formState.adminFullName}</p>
          <p className="text-xs text-slate-600 font-medium">Email: {formState.adminEmail}</p>
        </div>
      </div>
    </div>
  );
}

function WizardContent() {
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
    toast.success(`Tenant ${created.companyName} provisioned successfully!`);
    navigate('/platform/tenants');
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Create Tenant</h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Building2 className="h-4 w-4" />
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
          <Button variant="accent" size="sm" onClick={async () => { await saveDraft(); toast.success('Saved as draft'); }} className="gap-2 font-bold shadow-sm">
            <Save className="h-4 w-4" /> Save as Draft
          </Button>
        </div>
      </div>

      {/* 6-Step Progress Header matching Create Tenant Step 1.png */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs text-xs font-bold">
        {[
          { label: 'Company Details', desc: 'Basic info' },
          { label: 'Industry & Profile', desc: 'Business profile' },
          { label: 'Administrator', desc: 'Primary admin' },
          { label: 'Plan & Subscription', desc: 'Plan & limits' },
          { label: 'Modules', desc: 'Enable modules' },
          { label: 'Review & Confirm', desc: 'Review & create' },
        ].map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;

          return (
            <button
              key={idx}
              onClick={() => setCurrentStep(stepNum)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-blue-600 bg-blue-50/80 text-blue-700 ring-2 ring-blue-100'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                  : 'border-slate-100 text-slate-400 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                  isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                </span>
                <div className="truncate">
                  <p className="font-extrabold text-[12px] truncate">{step.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Content & Live Right Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          {currentStep === 1 && <Step1CompanyDetails />}
          {currentStep === 2 && <Step2IndustryProfile />}
          {currentStep === 3 && <Step3Administrator />}
          {currentStep === 4 && <Step4PlanSubscription />}
          {currentStep === 5 && <Step5Modules />}
          {currentStep === 6 && <Step6ReviewConfirm />}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="gap-2 font-bold"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            {currentStep < 6 ? (
              <Button variant="accent" size="sm" onClick={handleNext} className="gap-2 font-bold shadow-sm">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" size="sm" onClick={handleFinish} className="gap-2 font-extrabold shadow-sm">
                <CheckCircle2 className="h-4 w-4" /> Create Tenant
              </Button>
            )}
          </div>
        </div>

        {/* Right Tenant Creation Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-sans">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Tenant Creation Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Company</span>
                <span className="font-bold text-[#0D1F3D]">{formState.companyName || 'Not provided'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Industry</span>
                <span className="font-bold text-[#0D1F3D]">{formState.industryId || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Administrator</span>
                <span className="font-bold text-[#0D1F3D]">{formState.adminFullName || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateTenantWizardPage() {
  return (
    <TenantCreationProvider>
      <WizardContent />
    </TenantCreationProvider>
  );
}
