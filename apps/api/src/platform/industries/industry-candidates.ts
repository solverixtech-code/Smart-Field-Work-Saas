// Reviewed Phase 0.7 fixture projection; NOT production-approved or automatically published.
// Source: apps/web/src/features/platform/tenants/fixtures/platform.fixtures.ts
export const INDUSTRY_CANDIDATES = [
  {
    id: 'ind_pharma',
    code: 'PHARMA',
    label: 'Pharma & Healthcare',
    category: 'Healthcare',
    description:
      'Medical sales reps, sample distribution, doctor visits & chemist detailing',
    defaultModules: ['core_crm', 'field_visits', 'demo_scheduler'],
  },
  {
    id: 'ind_fmcg',
    code: 'FMCG',
    label: 'FMCG & Consumer Goods',
    category: 'Retail & Consumer',
    description:
      'Distributor sales reps, primary/secondary orders, retail store merchandising',
    defaultModules: ['core_crm', 'field_visits', 'order_management'],
  },
  {
    id: 'ind_solar',
    code: 'SOLAR',
    label: 'Solar & Renewable Energy',
    category: 'Energy & Utilities',
    description:
      'Rooftop site survey, lead qualification, solar installer field visits',
    defaultModules: ['core_crm', 'field_visits'],
  },
  {
    id: 'ind_retail',
    code: 'RETAIL',
    label: 'Retail & Franchise Ops',
    category: 'Retail & Consumer',
    description:
      'Store audit, visual merchandising, franchise sales verification',
    defaultModules: ['core_crm', 'field_visits', 'attendance'],
  },
  {
    id: 'ind_construction',
    code: 'CONSTRUCTION',
    label: 'Construction & Real Estate',
    category: 'Real Estate & Infra',
    description:
      'Site engineer visits, architect liaison, project material lead tracking',
    defaultModules: ['core_crm', 'field_visits'],
  },
  {
    id: 'ind_banking',
    code: 'BANKING',
    label: 'Banking & Financial Services',
    category: 'BFSI',
    description: 'DSAs, field recovery agents, home loan verification officers',
    defaultModules: ['core_crm', 'field_visits', 'demo_scheduler'],
  },
  {
    id: 'ind_insurance',
    code: 'INSURANCE',
    label: 'Insurance & Mutual Funds',
    category: 'BFSI',
    description:
      'Agency sales managers, policy renewals, field claim inspection',
    defaultModules: ['core_crm', 'field_visits', 'whatsapp_automation'],
  },
  {
    id: 'ind_telecom',
    code: 'TELECOM',
    label: 'Telecom & ISP Operations',
    category: 'Telecommunications',
    description:
      'Broadband feasibility survey, SIM distribution, enterprise sales',
    defaultModules: ['core_crm', 'field_visits'],
  },
  {
    id: 'ind_logistics',
    code: 'LOGISTICS',
    label: 'Logistics & Supply Chain',
    category: 'Transport & Freight',
    description:
      'Freight sales reps, warehouse audit, fleet driver dispatch tracking',
    defaultModules: ['core_crm', 'field_visits', 'attendance'],
  },
  {
    id: 'ind_agri',
    code: 'AGRI',
    label: 'Agri Inputs & Crop Protection',
    category: 'Agriculture',
    description:
      'Field agronomists, farmer dealer network, crop demo field trials',
    defaultModules: ['core_crm', 'field_visits', 'demo_scheduler'],
  },
  {
    id: 'ind_automotive',
    code: 'AUTOMOTIVE',
    label: 'Automotive & Auto Components',
    category: 'Manufacturing',
    description:
      'OEM dealer managers, spare parts sales, mechanic loyalty programs',
    defaultModules: ['core_crm', 'field_visits', 'demo_scheduler'],
  },
  {
    id: 'ind_edtech',
    code: 'EDTECH',
    label: 'EdTech & Higher Education',
    category: 'Education',
    description:
      'Academic counselors, school/college outreach, student admission demos',
    defaultModules: ['core_crm', 'demo_scheduler', 'whatsapp_automation'],
  },
  {
    id: 'ind_chemical',
    code: 'CHEMICAL',
    label: 'Chemicals & Specialty Materials',
    category: 'Manufacturing',
    description: 'B2B key account managers, industrial plant technical trials',
    defaultModules: ['core_crm', 'field_visits', 'order_management'],
  },
  {
    id: 'ind_durables',
    code: 'DURABLES',
    label: 'Consumer Durables & Electronics',
    category: 'Retail & Consumer',
    description:
      'Dealer showroom visits, warranty claim audit, promoter attendance',
    defaultModules: ['core_crm', 'field_visits', 'attendance'],
  },
  {
    id: 'ind_apparel',
    code: 'APPAREL',
    label: 'Apparel & Fashion Brands',
    category: 'Retail & Consumer',
    description:
      'Multi-brand outlet sales reps, fashion collection booking orders',
    defaultModules: ['core_crm', 'field_visits', 'order_management'],
  },
  {
    id: 'ind_hardware',
    code: 'HARDWARE',
    label: 'Paints & Building Hardware',
    category: 'Real Estate & Infra',
    description:
      'Painter contractor meets, dealer billing, tinting machine audit',
    defaultModules: ['core_crm', 'field_visits', 'order_management'],
  },
  {
    id: 'ind_medical',
    code: 'MEDICAL_DEVICE',
    label: 'Medical Devices & Equipment',
    category: 'Healthcare',
    description: 'Hospital OT demos, surgeon relations, equipment AMC tracking',
    defaultModules: ['core_crm', 'field_visits', 'demo_scheduler'],
  },
  {
    id: 'ind_hospitality',
    code: 'HOSPITALITY',
    label: 'Hospitality & HORECA',
    category: 'Services',
    description:
      'Hotel & restaurant sales reps, food supply distribution orders',
    defaultModules: ['core_crm', 'field_visits', 'order_management'],
  },
  {
    id: 'ind_waste',
    code: 'WASTE_MGMT',
    label: 'Waste Management & ESG',
    category: 'Services & ESG',
    description: 'E-waste collection audit, commercial recycling compliance',
    defaultModules: ['core_crm', 'field_visits'],
  },
  {
    id: 'ind_facility',
    code: 'FACILITY',
    label: 'Facility Management & Security',
    category: 'Services',
    description:
      'Guarding site audit, facility supervisor inspection, biometric attendance',
    defaultModules: ['core_crm', 'field_visits', 'attendance'],
  },
  {
    id: 'ind_textile',
    code: 'TEXTILE',
    label: 'Textiles & Yarn Spinning',
    category: 'Manufacturing',
    description: 'Weaving mill rep visits, export house order management',
    defaultModules: ['core_crm', 'field_visits', 'order_management'],
  },
  {
    id: 'ind_power',
    code: 'POWER_DIST',
    label: 'Power & Utility Metering',
    category: 'Energy & Utilities',
    description: 'Smart meter inspection, discom field audit, theft detection',
    defaultModules: ['core_crm', 'field_visits'],
  },
  {
    id: 'ind_diagnostics',
    code: 'DIAGNOSTICS',
    label: 'Diagnostics & Pathology Labs',
    category: 'Healthcare',
    description: 'Phlebotomist home pickup dispatch, clinic collection network',
    defaultModules: ['core_crm', 'field_visits'],
  },
  {
    id: 'ind_ecom',
    code: 'ECOM_LOGISTICS',
    label: 'E-Commerce Hyperlocal Delivery',
    category: 'Transport & Freight',
    description:
      'Dark store manager audit, last-mile delivery executive tracking',
    defaultModules: ['core_crm', 'field_visits', 'attendance'],
  },
  {
    id: 'ind_saas',
    code: 'SOFTWARE_SAAS',
    label: 'Software & Cloud SaaS Services',
    category: 'Technology',
    description:
      'Enterprise B2B account executives, client onboarding & renewals',
    defaultModules: ['core_crm', 'demo_scheduler', 'whatsapp_automation'],
  },
] as const;
