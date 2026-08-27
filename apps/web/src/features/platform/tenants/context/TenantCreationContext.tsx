import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TenantCreateFormState, ProvisioningType, PaymentCollectionMethod } from '../types/platform.types';
import { tenantService } from '../services/tenant.service';

const INITIAL_STATE: TenantCreateFormState = {
  companyName: '',
  legalEntityName: '',
  slug: '',
  domain: '',
  website: '',
  taxId: '',
  companySize: 'Medium (51 - 250 employees)',
  country: 'India',
  currency: 'INR - Indian Rupee (₹)',
  state: 'Maharashtra',
  city: 'Mumbai',
  addressLine1: '',
  addressLine2: '',
  pincode: '',
  dateFormat: 'DD MMM YYYY',
  financialYearStart: 'April',

  industryId: 'Pharma & Healthcare',
  timezone: '(GMT+05:30) Asia/Kolkata',
  totalEmployees: '',
  fieldUsers: '',
  yearsInBusiness: '5 - 10 Years',
  businessModel: 'B2B',
  branchCount: '',
  operatingCountries: 'India',
  preferredLanguage: 'English',
  description: '',
  weekStartDay: 'Monday',

  adminFullName: '',
  adminEmail: '',
  adminPhone: '',
  adminDesignation: '',
  adminDepartment: 'Administration',
  adminLanguage: 'English',
  adminTimezone: '(GMT+05:30) Asia/Kolkata',
  adminCommunicationEmail: '',
  adminUsername: '',
  adminPassword: '',
  adminConfirmPassword: '',
  sendInviteEmail: true,

  planId: 'plan_growth',
  provisioningType: 'Free Trial',
  userLicensesCount: 25,
  trialDurationDays: 14,
  trialConversionPolicy: 'Auto-convert to Growth Plan after trial',
  paymentCollectionMethod: 'Send Checkout Link to Customer',
  billingContactName: '',
  billingContactEmail: '',
  billingCycle: 'Yearly (Save 17%)',
  seatLimit: '150',
  storageLimit: '200 GB',
  subscriptionStartDate: '2026-05-24',

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
      website: 'www.sunrisehealthcare.com',
      taxId: '27ABCDE1234F1ZH',
      companySize: 'Medium (51 - 250 employees)',
      country: 'India',
      currency: 'INR - Indian Rupee (₹)',
      state: 'Maharashtra',
      city: 'Mumbai',
      addressLine1: '101, Business Park',
      addressLine2: 'Andheri East',
      pincode: '400069',
      dateFormat: 'DD MMM YYYY',
      financialYearStart: 'April',

      industryId: t.industryLabel || 'Pharma & Healthcare',
      timezone: '(GMT+05:30) Asia/Kolkata',
      totalEmployees: '126',
      fieldUsers: '35',
      yearsInBusiness: '5 - 10 Years',
      businessModel: 'B2B',
      branchCount: '6',
      operatingCountries: 'India',
      preferredLanguage: 'English',
      description: 'Pharmaceutical distribution and healthcare solutions provider across western India.',
      weekStartDay: 'Monday',

      adminFullName: t.adminUser?.fullName || 'Rahul Sharma',
      adminEmail: t.adminUser?.email || 'rahul.sharma@sunrisehealthcare.com',
      adminPhone: '9876543210',
      adminDesignation: 'CEO',
      adminDepartment: 'Administration',
      adminLanguage: 'English',
      adminTimezone: '(GMT+05:30) Asia/Kolkata',
      adminCommunicationEmail: 'rahul.sharma@sunrisehealthcare.com',
      adminUsername: 'rahul.sharma@sunrisehealthcare.com',
      adminPassword: '',
      adminConfirmPassword: '',
      sendInviteEmail: true,

      planId: 'professional',
      provisioningType: 'Payment Required',
      userLicensesCount: 150,
      trialDurationDays: 0,
      trialConversionPolicy: 'Auto-convert to Professional Plan',
      paymentCollectionMethod: 'Send Checkout Link to Customer',
      billingContactName: 'Rahul Sharma',
      billingContactEmail: 'rahul.sharma@sunrisehealthcare.com',
      billingCycle: 'Yearly (Save 17%)',
      seatLimit: '150',
      storageLimit: '200 GB',
      subscriptionStartDate: '2026-05-24',

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
