import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TenantCreateFormState, ProvisioningType, PaymentCollectionMethod } from '../types/platform.types';
import { tenantService } from '../services/tenant.service';

const INITIAL_STATE: TenantCreateFormState = {
  companyName: '',
  legalEntityName: '',
  slug: '',
  domain: '',
  taxId: '',
  companySize: '50-200 Employees',
  country: 'India',
  currency: 'INR (₹)',

  industryId: 'ind_pharma',
  timezone: 'Asia/Kolkata (IST +5:30)',

  adminFullName: '',
  adminEmail: '',
  adminPhone: '',
  adminDesignation: 'VP of Operations',
  sendInviteEmail: true,

  planId: 'plan_growth',
  provisioningType: 'Free Trial',
  userLicensesCount: 25,
  trialDurationDays: 14,
  trialConversionPolicy: 'Auto-convert to Growth Plan after trial',
  paymentCollectionMethod: 'Send Checkout Link to Customer',
  billingContactName: '',
  billingContactEmail: '',

  selectedModuleCodes: ['core_crm', 'field_visits', 'demo_scheduler', 'order_management', 'attendance_plus'],

  isDraft: false,
};

interface TenantCreationContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formState: TenantCreateFormState;
  updateFormState: (updates: Partial<TenantCreateFormState>) => void;
  loadTenantForEdit: (tenant: any) => void;
  resetForm: () => void;
  saveDraft: () => Promise<void>;
  submitTenant: () => Promise<any>;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

const TenantCreationContext = createContext<TenantCreationContextType | undefined>(undefined);

export const TenantCreationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<TenantCreateFormState>(INITIAL_STATE);
  const [isDirty, setIsDirty] = useState(false);

  const updateFormState = (updates: Partial<TenantCreateFormState>) => {
    setFormState((prev) => {
      const next = { ...prev, ...updates };
      if (updates.companyName && !prev.slug) {
        next.slug = updates.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        next.domain = `${next.slug}.smartfieldwork.com`;
      }
      return next;
    });
    setIsDirty(true);
  };

  const loadTenantForEdit = (t: any) => {
    setFormState({
      companyName: t.companyName || 'Sunrise Healthcare Pvt Ltd',
      legalEntityName: 'Sunrise Healthcare Private Limited',
      slug: 'srhc-tnt',
      domain: t.domain || 'srhc-tnt.smartfieldwork.com',
      taxId: '27ABCDE1234F1ZH',
      companySize: 'Medium (51 - 250 employees)',
      country: 'India',
      currency: 'INR - Indian Rupee (₹)',

      industryId: t.industryLabel || 'Pharma & Healthcare',
      timezone: '(GMT+05:30) Asia/Kolkata',

      adminFullName: t.adminUser?.fullName || 'Rahul Sharma',
      adminEmail: t.adminUser?.email || 'rahul.sharma@sunrisehealthcare.com',
      adminPhone: '9876543210',
      adminDesignation: 'CEO',
      sendInviteEmail: true,

      planId: 'professional',
      provisioningType: 'Payment Required',
      userLicensesCount: 150,
      trialDurationDays: 0,
      trialConversionPolicy: 'Auto-convert to Professional Plan',
      paymentCollectionMethod: 'Send Checkout Link to Customer',
      billingContactName: 'Rahul Sharma',
      billingContactEmail: 'rahul.sharma@sunrisehealthcare.com',

      selectedModuleCodes: ['core_crm', 'field_visits', 'demo_scheduler', 'order_management', 'attendance_plus', 'whatsapp_automation'],
      isDraft: false,
    });
  };

  const resetForm = () => {
    setFormState(INITIAL_STATE);
    setCurrentStep(1);
    setIsDirty(false);
  };

  const saveDraft = async () => {
    const draftState = { ...formState, isDraft: true };
    await tenantService.createTenant(draftState);
    setIsDirty(false);
  };

  const submitTenant = async () => {
    const finalState = { ...formState, isDraft: false };
    const created = await tenantService.createTenant(finalState);
    setIsDirty(false);
    return created;
  };

  return (
    <TenantCreationContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formState,
        updateFormState,
        loadTenantForEdit,
        resetForm,
        saveDraft,
        submitTenant,
        isDirty,
        setIsDirty,
      }}
    >
      {children}
    </TenantCreationContext.Provider>
  );
};

export const useTenantCreation = () => {
  const context = useContext(TenantCreationContext);
  if (!context) {
    throw new Error('useTenantCreation must be used within a TenantCreationProvider');
  }
  return context;
};
