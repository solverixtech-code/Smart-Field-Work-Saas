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
  Check
} from 'lucide-react';
import { Button, Input, Select, Checkbox } from '../../components/ui';
import { TenantCreationProvider, useTenantCreation } from '../../features/platform/tenants/context/TenantCreationContext';
import { PLATFORM_INDUSTRIES, PLATFORM_PLANS, PLATFORM_MODULES } from '../../features/platform/tenants/fixtures/platform.fixtures';
import { usePlatformPermissions } from '../../features/platform/tenants/hooks/usePlatformPermissions';
import { ProvisioningType, PaymentCollectionMethod } from '../../features/platform/tenants/types/platform.types';

function Step1CompanyDetails() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">1. Company Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Company Name *"
          placeholder="e.g. Apex Healthcare Pvt Ltd"
          value={formState.companyName}
          onChange={(e) => updateFormState({ companyName: e.target.value })}
        />
        <Input
          label="Legal Entity Name (Optional)"
          placeholder="e.g. Apex Healthcare Private Limited"
          value={formState.legalEntityName}
          onChange={(e) => updateFormState({ legalEntityName: e.target.value })}
        />
        <Input
          label="Subdomain / Slug *"
          placeholder="apex-pharma"
          value={formState.slug}
          onChange={(e) => updateFormState({ slug: e.target.value, domain: `${e.target.value}.smartfieldwork.com` })}
        />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 block">Workspace Domain Preview</label>
          <div className="w-full rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-[#0D1F3D]">
            https://{formState.slug || 'company'}.smartfieldwork.com
          </div>
        </div>
        <Input
          label="Tax ID / GSTIN / CIN (Optional)"
          placeholder="e.g. 27AABCA1234F1ZB"
          value={formState.taxId}
          onChange={(e) => updateFormState({ taxId: e.target.value })}
        />
        <Select
          label="Company Size *"
          value={formState.companySize}
          onChange={(e) => updateFormState({ companySize: e.target.value })}
          options={[
            { value: '1-10 Employees', label: '1-10 Employees' },
            { value: '10-50 Employees', label: '10-50 Employees' },
            { value: '50-200 Employees', label: '50-200 Employees' },
            { value: '200-500 Employees', label: '200-500 Employees' },
            { value: '500+ Employees', label: '500+ Employees (Enterprise)' },
          ]}
          searchable={false}
        />
        <Select
          label="Country *"
          value={formState.country}
          onChange={(e) => updateFormState({ country: e.target.value })}
          options={[
            { value: 'India', label: 'India (₹)' },
            { value: 'United States', label: 'United States ($)' },
            { value: 'United Arab Emirates', label: 'United Arab Emirates (AED)' },
            { value: 'Singapore', label: 'Singapore (SGD)' },
          ]}
          searchable={true}
        />
        <Select
          label="Currency *"
          value={formState.currency}
          onChange={(e) => updateFormState({ currency: e.target.value })}
          options={[
            { value: 'INR (₹)', label: 'INR (₹) - Indian Rupee' },
            { value: 'USD ($)', label: 'USD ($) - US Dollar' },
            { value: 'AED', label: 'AED - UAE Dirham' },
          ]}
          searchable={false}
        />
      </div>
    </div>
  );
}

function Step2IndustryProfile() {
  const { formState, updateFormState } = useTenantCreation();
  const selectedInd = PLATFORM_INDUSTRIES.find((i) => i.id === formState.industryId);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">2. Industry & Profile (25+ Supported Industries)</h3>
      <p className="text-xs text-slate-500 font-medium">Select the tenant's primary industry. This configures industry-specific field sales presets.</p>
      
      <Select
        label="Select Primary Industry *"
        value={formState.industryId}
        onChange={(e) => updateFormState({ industryId: e.target.value })}
        options={PLATFORM_INDUSTRIES.map((ind) => ({
          value: ind.id,
          label: `${ind.label} (${ind.code})`,
          sublabel: ind.description,
        }))}
        searchable={true}
      />

      {selectedInd && (
        <div className="rounded-sm border border-indigo-100 bg-indigo-50/60 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-indigo-900">{selectedInd.label}</span>
            <span className="bg-indigo-600 text-white font-mono text-[10px] px-2 py-0.5 rounded-sm font-extrabold">{selectedInd.code}</span>
          </div>
          <p className="text-indigo-800 font-medium">{selectedInd.description}</p>
          <div className="pt-2 flex flex-wrap gap-1.5 items-center">
            <span className="font-bold text-indigo-950 text-[11px]">Recommended Modules:</span>
            {selectedInd.defaultModules.map((m) => (
              <span key={m} className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-sm border border-indigo-200 text-[10px]">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      <Select
        label="Default Timezone *"
        value={formState.timezone}
        onChange={(e) => updateFormState({ timezone: e.target.value })}
        options={[
          { value: 'Asia/Kolkata (IST +5:30)', label: 'Asia/Kolkata (IST +5:30)' },
          { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
          { value: 'America/New_York (EST)', label: 'America/New_York (EST)' },
          { value: 'Asia/Dubai (GST +4:00)', label: 'Asia/Dubai (GST +4:00)' },
        ]}
        searchable={true}
      />
    </div>
  );
}

function Step3Administrator() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">3. Primary Tenant Administrator</h3>
      <p className="text-xs text-slate-500 font-medium">First administrator account created for this customer tenant workspace.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Admin Full Name *"
          placeholder="e.g. Vikramaditya Sharma"
          value={formState.adminFullName}
          onChange={(e) => updateFormState({ adminFullName: e.target.value })}
        />
        <Input
          label="Admin Work Email *"
          type="email"
          placeholder="admin@company.com"
          value={formState.adminEmail}
          onChange={(e) => updateFormState({ adminEmail: e.target.value })}
        />
        <Input
          label="Admin Phone Number *"
          type="tel"
          placeholder="+91 98200 11223"
          value={formState.adminPhone}
          onChange={(e) => updateFormState({ adminPhone: e.target.value })}
        />
        <Input
          label="Designation / Role *"
          placeholder="e.g. VP of Field Sales"
          value={formState.adminDesignation}
          onChange={(e) => updateFormState({ adminDesignation: e.target.value })}
        />
      </div>

      <div className="pt-2">
        <Checkbox
          checked={formState.sendInviteEmail}
          onChange={(e) => updateFormState({ sendInviteEmail: e.target.checked })}
          label="Send welcome email with password setup link immediately after provisioning"
        />
      </div>
    </div>
  );
}

function Step4PlanSubscription() {
  const { formState, updateFormState } = useTenantCreation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">4. Plan & Subscription Provisioning</h3>

      {/* Plan Selection Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#0D1F3D]">Select Pricing Tier *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLATFORM_PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => updateFormState({ planId: plan.id })}
              className={`p-4 rounded-sm border text-left transition-all cursor-pointer ${
                formState.planId === plan.id ? 'border-[#E20613] bg-red-50/50 shadow-xs ring-1 ring-[#E20613]' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-extrabold text-[#0D1F3D]">{plan.name}</span>
                <span className="text-[10px] font-extrabold bg-slate-100 px-1.5 py-0.5 rounded-sm">{plan.tier}</span>
              </div>
              <p className="text-lg font-extrabold text-[#0D1F3D]">₹{plan.monthlyPricePerUser} <span className="text-[10px] font-semibold text-slate-500">/ user / mo</span></p>
              <p className="text-[10px] text-slate-500 font-medium mt-2">Min {plan.minUsers} user licenses</p>
            </button>
          ))}
        </div>
      </div>

      {/* Provisioning Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#0D1F3D]">Provisioning Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['Free Trial', 'Payment Required', 'Invoice / Offline Payment', 'Enterprise Contract'] as ProvisioningType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateFormState({ provisioningType: type })}
              className={`p-3 rounded-sm border text-xs font-extrabold transition-all cursor-pointer ${
                formState.provisioningType === type ? 'border-[#E20613] bg-red-50/50 text-[#0D1F3D]' : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* User Licenses Slider / Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="User Licenses Count *"
          type="number"
          value={formState.userLicensesCount.toString()}
          onChange={(e) => updateFormState({ userLicensesCount: parseInt(e.target.value) || 5 })}
        />

        {/* Dynamic Provisioning Fields */}
        {formState.provisioningType === 'Free Trial' ? (
          <Select
            label="Trial Duration *"
            value={formState.trialDurationDays.toString()}
            onChange={(e) => updateFormState({ trialDurationDays: parseInt(e.target.value) || 14 })}
            options={[
              { value: '14', label: '14 Days Free Trial' },
              { value: '30', label: '30 Days Extended Trial' },
              { value: '60', label: '60 Days Special Pilot' },
            ]}
            searchable={false}
          />
        ) : (
          <Select
            label="Payment Collection Method *"
            value={formState.paymentCollectionMethod}
            onChange={(e) => updateFormState({ paymentCollectionMethod: e.target.value as PaymentCollectionMethod })}
            options={[
              { value: 'Send Checkout Link to Customer', label: 'Send Secure Checkout Link to Customer' },
              { value: 'Record Confirmed Offline Payment', label: 'Record Confirmed Offline Payment (Cheque/NEFT)' },
            ]}
            searchable={false}
          />
        )}
      </div>

      {formState.provisioningType !== 'Free Trial' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Billing Contact Name"
            placeholder="e.g. Accounts Department"
            value={formState.billingContactName}
            onChange={(e) => updateFormState({ billingContactName: e.target.value })}
          />
          <Input
            label="Billing Contact Email"
            type="email"
            placeholder="billing@company.com"
            value={formState.billingContactEmail}
            onChange={(e) => updateFormState({ billingContactEmail: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

function Step5Modules() {
  const { formState, updateFormState } = useTenantCreation();

  const toggleModule = (code: string) => {
    const current = formState.selectedModuleCodes;
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
    updateFormState({ selectedModuleCodes: next });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">5. Platform Module Enablement</h3>
      <p className="text-xs text-slate-500 font-medium">Enable features and add-on modules for this tenant workspace.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLATFORM_MODULES.map((mod) => {
          const checked = formState.selectedModuleCodes.includes(mod.code);
          return (
            <div
              key={mod.id}
              onClick={() => toggleModule(mod.code)}
              className={`p-3.5 rounded-sm border flex items-start gap-3 cursor-pointer transition-all ${
                checked ? 'border-[#E20613] bg-red-50/40 shadow-2xs' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Checkbox checked={checked} onChange={() => {}} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-extrabold text-[#0D1F3D]">{mod.name}</p>
                  {mod.isAddon && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">Add-on</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">{mod.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step6ReviewConfirm() {
  const { formState } = useTenantCreation();
  const selectedInd = PLATFORM_INDUSTRIES.find((i) => i.id === formState.industryId);
  const selectedPlan = PLATFORM_PLANS.find((p) => p.id === formState.planId);
  const calculatedMrr = formState.provisioningType === 'Free Trial' ? 0 : formState.userLicensesCount * (selectedPlan?.monthlyPricePerUser || 0);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">6. Review & Confirm Tenant Provisioning</h3>

      <div className="rounded-sm border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
          <div>
            <span className="text-slate-500 font-semibold block">Company Name</span>
            <span className="font-extrabold text-[#0D1F3D] text-sm">{formState.companyName || '—'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Workspace Domain</span>
            <span className="font-mono font-bold text-indigo-700">{formState.domain || '—'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-200 pb-3">
          <div>
            <span className="text-slate-500 font-semibold block">Industry</span>
            <span className="font-bold text-[#0D1F3D]">{selectedInd?.label}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Tenant Admin</span>
            <span className="font-bold text-[#0D1F3D]">{formState.adminFullName} ({formState.adminEmail})</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Provisioning Type</span>
            <span className="font-bold text-emerald-700">{formState.provisioningType}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-slate-500 font-semibold block">Pricing Plan</span>
            <span className="font-bold text-[#0D1F3D]">{selectedPlan?.name}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">User Licenses</span>
            <span className="font-mono font-bold text-[#0D1F3D]">{formState.userLicensesCount} Reps</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Calculated MRR</span>
            <span className="font-mono font-extrabold text-emerald-700 text-sm">₹{calculatedMrr.toLocaleString()} / mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardContent() {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, formState, saveDraft, submitTenant } = useTenantCreation();
  const { canCreateTenant } = usePlatformPermissions();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!canCreateTenant) {
    return (
      <div className="rounded-sm border border-rose-200 bg-rose-50 p-6 text-center space-y-3 font-sans">
        <ShieldAlert className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-extrabold text-rose-900">Access Restricted</h2>
        <p className="text-xs font-semibold text-rose-700 max-w-md mx-auto">
          Your current platform role does not have permission to provision new tenants. Permission required: <code>platform.tenants.create</code>.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/platform/tenants')} className="font-bold">
          ← Back to Tenants List
        </Button>
      </div>
    );
  }

  const selectedPlan = PLATFORM_PLANS.find((p) => p.id === formState.planId);
  const calculatedMrr = formState.provisioningType === 'Free Trial' ? 0 : formState.userLicensesCount * (selectedPlan?.monthlyPricePerUser || 0);

  const handleNext = () => {
    if (currentStep === 1 && !formState.companyName) {
      toast.error('Please enter company name to continue');
      return;
    }
    if (currentStep === 3 && (!formState.adminFullName || !formState.adminEmail)) {
      toast.error('Please enter primary admin details');
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
    <div className="space-y-5 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <button onClick={() => navigate('/platform/tenants')} className="hover:text-[#0D1F3D] cursor-pointer">
              Tenants
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#0D1F3D] font-bold">Tenant Creation Wizard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">Provision New SaaS Tenant</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Step {currentStep} of 6 — Preserves all entered data across steps.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={async () => { await saveDraft(); toast.success('Tenant saved as draft'); }} className="gap-1.5 font-bold">
            <Save className="h-3.5 w-3.5" /> Save as Draft
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(true)} className="font-bold text-rose-600">
            Cancel
          </Button>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 rounded-sm border border-slate-200 bg-white p-3 shadow-xs text-xs font-bold">
        {[
          '1. Company',
          '2. Industry',
          '3. Admin',
          '4. Plan',
          '5. Modules',
          '6. Review'
        ].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;

          return (
            <button
              key={label}
              onClick={() => setCurrentStep(stepNum)}
              className={`p-2 rounded-sm border text-left transition-all cursor-pointer ${
                isActive ? 'border-[#E20613] bg-red-50/60 text-[#E20613]' :
                isDone ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800' : 'border-slate-100 text-slate-400 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span>{label}</span>
                {isDone && <Check className="h-3 w-3 text-emerald-600" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Main Wizard Step Container (8 Cols) */}
        <div className="lg:col-span-8 rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          {currentStep === 1 && <Step1CompanyDetails />}
          {currentStep === 2 && <Step2IndustryProfile />}
          {currentStep === 3 && <Step3Administrator />}
          {currentStep === 4 && <Step4PlanSubscription />}
          {currentStep === 5 && <Step5Modules />}
          {currentStep === 6 && <Step6ReviewConfirm />}

          {/* Stepper Action Buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="gap-1.5 font-bold"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Step
            </Button>

            {currentStep < 6 ? (
              <Button variant="accent" size="sm" onClick={handleNext} className="gap-1.5 font-bold shadow-xs">
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" size="sm" onClick={handleFinish} className="gap-1.5 font-extrabold shadow-xs">
                <CheckCircle2 className="h-4 w-4" /> Provision & Activate Tenant Now
              </Button>
            )}
          </div>
        </div>

        {/* Live Right-Side Subscription Summary Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 font-sans text-xs">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Subscription Summary</h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Tenant</span>
                <span className="font-extrabold text-[#0D1F3D] text-right">{formState.companyName || 'New Tenant'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Selected Plan</span>
                <span className="font-bold text-[#0D1F3D]">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Provisioning Type</span>
                <span className="font-extrabold text-emerald-700">{formState.provisioningType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">User Licenses</span>
                <span className="font-mono font-bold text-[#0D1F3D]">{formState.userLicensesCount} Reps</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Enabled Modules</span>
                <span className="font-mono font-bold text-indigo-700">{formState.selectedModuleCodes.length} Modules</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-slate-600 font-extrabold">Estimated MRR</span>
                <span className="font-mono font-extrabold text-emerald-700 text-lg">
                  {formState.provisioningType === 'Free Trial' ? '₹0 (Trial)' : `₹${calculatedMrr.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-5 shadow-2xl space-y-4 font-sans">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Discard Tenant Creation?</h3>
            <p className="text-xs text-slate-600 font-medium">You have entered tenant provisioning parameters. Would you like to save as draft before leaving?</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setShowConfirmModal(false); navigate('/platform/tenants'); }}>
                Discard & Leave
              </Button>
              <Button variant="accent" size="sm" onClick={async () => { await saveDraft(); setShowConfirmModal(false); navigate('/platform/tenants'); }}>
                Save as Draft
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
      <WizardContent />
    </TenantCreationProvider>
  );
}
