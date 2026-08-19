export interface MasterRecordItem {
  id: string;
  category: string;
  name: string;
  code: string;
  description?: string;
  displayColor?: string;
  sortOrder: number;
  isActive: boolean;
  isSystemDefault: boolean;
}

export interface MasterCategoryConfig {
  id: string;
  name: string;
  description: string;
  group: 'HR & Personnel' | 'Sales & Pipeline' | 'Operations & Field' | 'Business & Merchants' | 'Payroll & Subscriptions';
  totalLabel: string;
  addTitle: string;
  editTitle: string;
  addLabel: string;
  searchPlaceholder: string;
  defaultCodePrefix: string;
}

export const masterCategories: MasterCategoryConfig[] = [
  // --- HR & PERSONNEL ---
  {
    id: 'designation',
    name: 'Designations',
    description: 'Job titles and organizational hierarchy levels used across executive profiles and payroll.',
    group: 'HR & Personnel',
    totalLabel: 'Total Designations',
    addTitle: 'Add New Designation',
    editTitle: 'Edit Designation',
    addLabel: 'Add Designation',
    searchPlaceholder: 'Search designations by title or code...',
    defaultCodePrefix: 'DESIG',
  },
  {
    id: 'team',
    name: 'Departments & Teams',
    description: 'Operational sales teams and regional field clusters assigned to field executives.',
    group: 'HR & Personnel',
    totalLabel: 'Total Teams',
    addTitle: 'Add New Team Cluster',
    editTitle: 'Edit Team Cluster',
    addLabel: 'Add Team Cluster',
    searchPlaceholder: 'Search departments or team names...',
    defaultCodePrefix: 'TEAM',
  },
  {
    id: 'contact_role',
    name: 'Merchant Contact Roles',
    description: 'Key personnel and decision maker roles for registered merchant accounts (Owner, Manager, Accountant).',
    group: 'HR & Personnel',
    totalLabel: 'Total Contact Roles',
    addTitle: 'Add Contact Role',
    editTitle: 'Edit Contact Role',
    addLabel: 'Add Contact Role',
    searchPlaceholder: 'Search contact roles...',
    defaultCodePrefix: 'ROLE',
  },
  {
    id: 'leave_type',
    name: 'Leave & Absence Types',
    description: 'Statutory and company leave categories (Casual Leave, Sick Leave, Earned Leave, Official Duty).',
    group: 'HR & Personnel',
    totalLabel: 'Total Leave Types',
    addTitle: 'Add Leave Type',
    editTitle: 'Edit Leave Type',
    addLabel: 'Add Leave Type',
    searchPlaceholder: 'Search leave categories...',
    defaultCodePrefix: 'LEAVE',
  },

  // --- SALES & PIPELINE ---
  {
    id: 'lead_stage',
    name: 'Lead Stages & Pipeline',
    description: 'CRM conversion funnel stages from initial lead contact to closed won or lost.',
    group: 'Sales & Pipeline',
    totalLabel: 'Total Pipeline Stages',
    addTitle: 'Add Pipeline Stage',
    editTitle: 'Edit Pipeline Stage',
    addLabel: 'Add Stage',
    searchPlaceholder: 'Search sales pipeline stages...',
    defaultCodePrefix: 'STAGE',
  },
  {
    id: 'lead_source',
    name: 'Lead Sources',
    description: 'Customer acquisition channels (Field Referral, Digital Ads, Inbound, Expo).',
    group: 'Sales & Pipeline',
    totalLabel: 'Total Lead Sources',
    addTitle: 'Add Lead Source',
    editTitle: 'Edit Lead Source',
    addLabel: 'Add Source',
    searchPlaceholder: 'Search lead acquisition sources...',
    defaultCodePrefix: 'SRC',
  },
  {
    id: 'lost_reason',
    name: 'Lost Deal Reasons',
    description: 'Standardized reasons logged when a sales deal is marked as Closed Lost.',
    group: 'Sales & Pipeline',
    totalLabel: 'Total Lost Reasons',
    addTitle: 'Add Lost Reason',
    editTitle: 'Edit Lost Reason',
    addLabel: 'Add Lost Reason',
    searchPlaceholder: 'Search lost deal reasons...',
    defaultCodePrefix: 'LOST',
  },
  {
    id: 'lead_rating',
    name: 'Lead Ratings & Intent',
    description: 'Opportunity intent scoring levels (Hot, Warm, Cold, Key Account).',
    group: 'Sales & Pipeline',
    totalLabel: 'Total Lead Ratings',
    addTitle: 'Add Rating Level',
    editTitle: 'Edit Rating Level',
    addLabel: 'Add Rating',
    searchPlaceholder: 'Search lead intent ratings...',
    defaultCodePrefix: 'RAT',
  },

  // --- OPERATIONS & FIELD ---
  {
    id: 'territory',
    name: 'Territories & Zones',
    description: 'Geographic sales zones and field coverage territories.',
    group: 'Operations & Field',
    totalLabel: 'Total Territories',
    addTitle: 'Add Coverage Territory',
    editTitle: 'Edit Coverage Territory',
    addLabel: 'Add Territory',
    searchPlaceholder: 'Search field zones or territories...',
    defaultCodePrefix: 'ZONE',
  },
  {
    id: 'visit_type',
    name: 'Field Visit Types',
    description: 'Categorization of field executive client visits (Demo, Consultation, Collection, Audit).',
    group: 'Operations & Field',
    totalLabel: 'Total Visit Types',
    addTitle: 'Add Field Visit Type',
    editTitle: 'Edit Field Visit Type',
    addLabel: 'Add Visit Type',
    searchPlaceholder: 'Search visit types...',
    defaultCodePrefix: 'VISIT',
  },
  {
    id: 'visit_reason',
    name: 'Visit Cancellation Reasons',
    description: 'Standard reasons logged for uncompleted or cancelled field check-in visits.',
    group: 'Operations & Field',
    totalLabel: 'Total Cancellation Reasons',
    addTitle: 'Add Cancellation Reason',
    editTitle: 'Edit Cancellation Reason',
    addLabel: 'Add Reason',
    searchPlaceholder: 'Search cancellation reasons...',
    defaultCodePrefix: 'CANC',
  },
  {
    id: 'expense_category',
    name: 'Expense Categories',
    description: 'Field reimbursement heads (Fuel, Client Meetings, Parking, Tolls).',
    group: 'Operations & Field',
    totalLabel: 'Total Expense Heads',
    addTitle: 'Add Expense Category',
    editTitle: 'Edit Expense Category',
    addLabel: 'Add Expense Head',
    searchPlaceholder: 'Search expense categories...',
    defaultCodePrefix: 'EXP',
  },

  // --- BUSINESS & MERCHANTS ---
  {
    id: 'business_type',
    name: 'Business Categories',
    description: 'Retail and enterprise store classifications (Gym, Cafe, Retail Supermarket, Clinic).',
    group: 'Business & Merchants',
    totalLabel: 'Total Business Types',
    addTitle: 'Add Business Category',
    editTitle: 'Edit Business Category',
    addLabel: 'Add Business Type',
    searchPlaceholder: 'Search business types...',
    defaultCodePrefix: 'BIZ_CAT',
  },
  {
    id: 'business_scale',
    name: 'Business Revenue Slabs',
    description: 'Merchant turn-over and store size classification (Micro, Small, Medium, Enterprise).',
    group: 'Business & Merchants',
    totalLabel: 'Total Scale Slabs',
    addTitle: 'Add Revenue Slab',
    editTitle: 'Edit Revenue Slab',
    addLabel: 'Add Scale Slab',
    searchPlaceholder: 'Search revenue slabs...',
    defaultCodePrefix: 'SCALE',
  },
  {
    id: 'market_hub',
    name: 'Commercial Markets & Hubs',
    description: 'Local retail hubs, commercial street belts, and mall clusters.',
    group: 'Business & Merchants',
    totalLabel: 'Total Trade Hubs',
    addTitle: 'Add Market Hub',
    editTitle: 'Edit Market Hub',
    addLabel: 'Add Market Hub',
    searchPlaceholder: 'Search commercial market hubs...',
    defaultCodePrefix: 'HUB',
  },

  // --- PAYROLL & SUBSCRIPTIONS ---
  {
    id: 'incentive_type',
    name: 'Incentive Types',
    description: 'Approved closed won deal commission heads and performance bonus structures.',
    group: 'Payroll & Subscriptions',
    totalLabel: 'Total Incentive Rules',
    addTitle: 'Add Incentive Head',
    editTitle: 'Edit Incentive Head',
    addLabel: 'Add Incentive Head',
    searchPlaceholder: 'Search incentive types...',
    defaultCodePrefix: 'INC',
  },
  {
    id: 'allowance_type',
    name: 'Allowance Types',
    description: 'Fixed and variable salary allowance heads (HRA, Field Transport, Fuel, Special Allowances).',
    group: 'Payroll & Subscriptions',
    totalLabel: 'Total Allowance Heads',
    addTitle: 'Add Allowance Head',
    editTitle: 'Edit Allowance Head',
    addLabel: 'Add Allowance',
    searchPlaceholder: 'Search allowance categories...',
    defaultCodePrefix: 'ALLOW',
  },
  {
    id: 'deduction_type',
    name: 'Deduction Types',
    description: 'Statutory and policy deduction heads (PF, ESI, Professional Tax, TDS).',
    group: 'Payroll & Subscriptions',
    totalLabel: 'Total Deduction Heads',
    addTitle: 'Add Deduction Head',
    editTitle: 'Edit Deduction Head',
    addLabel: 'Add Deduction',
    searchPlaceholder: 'Search deduction rules...',
    defaultCodePrefix: 'DED',
  },
  {
    id: 'subscription_plan',
    name: 'SaaS Subscription Plans',
    description: 'Commercial AI consulting and platform tier plans (Starter, Professional, Enterprise).',
    group: 'Payroll & Subscriptions',
    totalLabel: 'Total Subscription Plans',
    addTitle: 'Add Subscription Plan',
    editTitle: 'Edit Subscription Plan',
    addLabel: 'Add SaaS Plan',
    searchPlaceholder: 'Search subscription plans...',
    defaultCodePrefix: 'PLAN',
  },
];

export const initialMasterRecords: Record<string, MasterRecordItem[]> = {
  // HR & Personnel
  designation: [
    { id: 'desig-1', category: 'designation', name: 'Field Executive', code: 'FIELD_EXEC', description: 'Primary field operations and client site executive.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#0D1F3D' },
    { id: 'desig-2', category: 'designation', name: 'Senior Sales Executive', code: 'SR_SALES_EXEC', description: 'Senior field sales representative managing high-value leads.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#059669' },
    { id: 'desig-3', category: 'designation', name: 'Team Leader', code: 'TEAM_LEAD', description: 'Manages field team cluster performance and task allocation.', sortOrder: 3, isActive: true, isSystemDefault: true, displayColor: '#D97706' },
    { id: 'desig-4', category: 'designation', name: 'Regional Sales Manager', code: 'REGIONAL_MGR', description: 'Oversees multi-zone territories and overall revenue targets.', sortOrder: 4, isActive: true, isSystemDefault: true, displayColor: '#7C3AED' },
  ],
  team: [
    { id: 'team-1', category: 'team', name: 'Western Suburbs Team', code: 'WESTERN_SUB', description: 'Covers Bandra, Andheri, Borivali field operations.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'team-2', category: 'team', name: 'Central Suburbs Team', code: 'CENTRAL_SUB', description: 'Covers Kurla, Ghatkopar, Mulund field operations.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'team-3', category: 'team', name: 'Thane Cluster Team', code: 'THANE_CLUSTER', description: 'Covers Thane and Navi Mumbai regional zones.', sortOrder: 3, isActive: true, isSystemDefault: true },
    { id: 'team-4', category: 'team', name: 'South Mumbai Enterprise', code: 'SOUTH_MUMBAI', description: 'Institutional and high net-worth sales coverage.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],
  contact_role: [
    { id: 'role-1', category: 'contact_role', name: 'Owner / Proprietor', code: 'OWNER', description: 'Primary business owner or partner with signing authority.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#7C3AED' },
    { id: 'role-2', category: 'contact_role', name: 'Store Manager', code: 'MANAGER', description: 'Day-to-day store manager handling operations.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#2563EB' },
    { id: 'role-3', category: 'contact_role', name: 'Operations Head', code: 'OPS_HEAD', description: 'Oversees logistics, inventory, and field rep visits.', sortOrder: 3, isActive: true, isSystemDefault: true, displayColor: '#D97706' },
    { id: 'role-4', category: 'contact_role', name: 'Accountant / Finance', code: 'FINANCE', description: 'Handles billing, invoices, and payment collection.', sortOrder: 4, isActive: true, isSystemDefault: true, displayColor: '#059669' },
  ],
  leave_type: [
    { id: 'lv-1', category: 'leave_type', name: 'Casual Leave (CL)', code: 'CASUAL_LEAVE', description: 'Short duration casual paid leave allotment.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'lv-2', category: 'leave_type', name: 'Sick Leave (SL)', code: 'SICK_LEAVE', description: 'Medical and health related absence allowance.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'lv-3', category: 'leave_type', name: 'Earned / Privilege Leave (EL)', code: 'EARNED_LEAVE', description: 'Accumulated paid annual leave allowance.', sortOrder: 3, isActive: true, isSystemDefault: true },
    { id: 'lv-4', category: 'leave_type', name: 'Official Outstation Duty (OD)', code: 'ON_DUTY', description: 'Approved field duty or outstation market survey.', sortOrder: 4, isActive: true, isSystemDefault: true },
  ],

  // Sales & Pipeline
  lead_stage: [
    { id: 'stg-1', category: 'lead_stage', name: 'New Lead Prospect', code: 'NEW_PROSPECT', description: 'Initial contact logged into system.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#3B82F6' },
    { id: 'stg-2', category: 'lead_stage', name: 'Site Visit Scheduled', code: 'SITE_VISIT', description: 'Field visit date confirmed.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#F59E0B' },
    { id: 'stg-3', category: 'lead_stage', name: 'Proposal Submitted', code: 'PROPOSAL', description: 'Commercial quote submitted.', sortOrder: 3, isActive: true, isSystemDefault: true, displayColor: '#8B5CF6' },
    { id: 'stg-4', category: 'lead_stage', name: 'Closed Won', code: 'CLOSED_WON', description: 'Deal finalized and contract signed.', sortOrder: 4, isActive: true, isSystemDefault: true, displayColor: '#10B981' },
    { id: 'stg-5', category: 'lead_stage', name: 'Closed Lost', code: 'CLOSED_LOST', description: 'Opportunity dropped or lost to competitor.', sortOrder: 5, isActive: true, isSystemDefault: true, displayColor: '#EF4444' },
  ],
  lead_source: [
    { id: 'src-1', category: 'lead_source', name: 'Direct Field Visit', code: 'FIELD_VISIT', description: 'Executive walk-in or cold visit.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'src-2', category: 'lead_source', name: 'Partner / Referral', code: 'REFERRAL', description: 'Existing client or broker referral.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'src-3', category: 'lead_source', name: 'Digital Ad Campaign', code: 'DIGITAL_ADS', description: 'Google / Meta inbound campaign.', sortOrder: 3, isActive: true, isSystemDefault: false },
    { id: 'src-4', category: 'lead_source', name: 'Industry Expo', code: 'EXPO', description: 'Trade show and expo inquiries.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],
  lost_reason: [
    { id: 'lost-1', category: 'lost_reason', name: 'Price / Budget Constraint', code: 'HIGH_PRICE', description: 'Merchant found pricing higher than budget.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'lost-2', category: 'lost_reason', name: 'Competitor Selected', code: 'COMPETITOR', description: 'Client chose alternative SaaS provider.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'lost-3', category: 'lost_reason', name: 'Unresponsive Merchant', code: 'UNRESPONSIVE', description: 'No response after multiple follow-ups.', sortOrder: 3, isActive: true, isSystemDefault: true },
    { id: 'lost-4', category: 'lost_reason', name: 'Feature Gap', code: 'FEATURE_GAP', description: 'Specific required feature not supported.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],
  lead_rating: [
    { id: 'rat-1', category: 'lead_rating', name: 'Hot Lead (High Intent)', code: 'HOT_LEAD', description: 'Ready to convert within 7 days.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#EF4444' },
    { id: 'rat-2', category: 'lead_rating', name: 'Warm Lead (Active Evaluation)', code: 'WARM_LEAD', description: 'Evaluation in progress, follow-up required.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#F59E0B' },
    { id: 'rat-3', category: 'lead_rating', name: 'Cold Lead (Nurturing)', code: 'COLD_LEAD', description: 'Low immediate intent, added to newsletter.', sortOrder: 3, isActive: true, isSystemDefault: true, displayColor: '#3B82F6' },
  ],

  // Operations & Field
  territory: [
    { id: 'terr-1', category: 'territory', name: 'Andheri & BKC Zone', code: 'ANDHERI_BKC', description: 'Key commercial hub and office parks.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'terr-2', category: 'territory', name: 'Powai Tech Belt', code: 'POWAI_TECH', description: 'Tech parks and corporate towers.', sortOrder: 2, isActive: true, isSystemDefault: false },
    { id: 'terr-3', category: 'territory', name: 'Thane Belapur Road', code: 'THANE_BELAPUR', description: 'Industrial and IT corridor.', sortOrder: 3, isActive: true, isSystemDefault: false },
  ],
  visit_type: [
    { id: 'vtype-1', category: 'visit_type', name: 'Sales Pitch & Demo', code: 'SALES_PITCH', description: 'In-person AI product demo for store owner.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#2563EB' },
    { id: 'vtype-2', category: 'visit_type', name: 'Follow-up Consultation', code: 'FOLLOW_UP', description: 'Follow-up meeting to address commercial terms.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#F59E0B' },
    { id: 'vtype-3', category: 'visit_type', name: 'Payment Collection', code: 'COLLECTION', description: 'Cheque or digital payment collection visit.', sortOrder: 3, isActive: true, isSystemDefault: true, displayColor: '#10B981' },
    { id: 'vtype-4', category: 'visit_type', name: 'Onboarding & Training', code: 'ONBOARDING', description: 'Staff training and software installation.', sortOrder: 4, isActive: true, isSystemDefault: false, displayColor: '#8B5CF6' },
  ],
  visit_reason: [
    { id: 'vcan-1', category: 'visit_reason', name: 'Merchant Owner Unavailable', code: 'OWNER_BUSY', description: 'Store decision maker was out of town or busy.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'vcan-2', category: 'visit_reason', name: 'Rescheduled by Client', code: 'CLIENT_RESCHEDULE', description: 'Client requested postponement to later date.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'vcan-3', category: 'visit_reason', name: 'Weather / Heavy Rain', code: 'WEATHER', description: 'Severe weather or flooded roads in zone.', sortOrder: 3, isActive: true, isSystemDefault: false },
    { id: 'vcan-4', category: 'visit_reason', name: 'Store Closed / Holiday', code: 'STORE_CLOSED', description: 'Retail establishment closed on visit day.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],
  expense_category: [
    { id: 'exp-1', category: 'expense_category', name: 'Fuel & Commute', code: 'FUEL', description: 'Field travel fuel expenses.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'exp-2', category: 'expense_category', name: 'Client Lunch & Hospitality', code: 'CLIENT_MEET', description: 'Prospect meeting expenses.', sortOrder: 3, isActive: true, isSystemDefault: true },
    { id: 'exp-3', category: 'expense_category', name: 'Toll & Parking Fees', code: 'TOLL_PARKING', description: 'Highway tolls and commercial parking.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],

  // Business & Merchants
  business_type: [
    { id: 'btype-1', category: 'business_type', name: 'Gym & Fitness Center', code: 'GYM_FITNESS', description: 'Gyms, yoga studios, and fitness centers.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#D97706' },
    { id: 'btype-2', category: 'business_type', name: 'Food & Beverage', code: 'FOOD_BEV', description: 'Cafes, restaurants, and bakeries.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#059669' },
    { id: 'btype-3', category: 'business_type', name: 'Retail Supermarket', code: 'RETAIL_SUPER', description: 'Grocery stores and supermarket chains.', sortOrder: 3, isActive: true, isSystemDefault: true, displayColor: '#7C3AED' },
    { id: 'btype-4', category: 'business_type', name: 'Beauty & Wellness Salon', code: 'SALON_BEAUTY', description: 'Salons, spas, and skincare clinics.', sortOrder: 4, isActive: true, isSystemDefault: true, displayColor: '#EC4899' },
    { id: 'btype-5', category: 'business_type', name: 'Healthcare & Clinic', code: 'HEALTHCARE', description: 'Polyclinics and diagnostic centers.', sortOrder: 5, isActive: true, isSystemDefault: true, displayColor: '#2563EB' },
  ],
  business_scale: [
    { id: 'bscale-1', category: 'business_scale', name: 'Micro Store (< ₹25 Lakhs)', code: 'SCALE_MICRO', description: 'Single location small retail store.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'bscale-2', category: 'business_scale', name: 'Small Business (₹25L - ₹50L)', code: 'SCALE_SMALL', description: 'Established single outlet business.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'bscale-3', category: 'business_scale', name: 'Medium Business (₹50L - ₹2 Cr)', code: 'SCALE_MEDIUM', description: 'Multi-outlet or large retail store.', sortOrder: 3, isActive: true, isSystemDefault: true },
    { id: 'bscale-4', category: 'business_scale', name: 'Large Enterprise (₹2 Cr+)', code: 'SCALE_ENTERPRISE', description: 'Regional retail chain or enterprise account.', sortOrder: 4, isActive: true, isSystemDefault: true },
  ],
  market_hub: [
    { id: 'hub-1', category: 'market_hub', name: 'Orion Mall & Dr. C. H. Street', code: 'ORION_MALL_HUB', description: 'Primary retail corridor in South Mumbai.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'hub-2', category: 'market_hub', name: 'FC Road Commercial Belt', code: 'FC_ROAD_HUB', description: 'High-footfall youth and cafe market in Pune.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'hub-3', category: 'market_hub', name: 'Hill Road Shopping Street', code: 'HILL_ROAD_HUB', description: 'Fashion and retail hub in Bandra West.', sortOrder: 3, isActive: true, isSystemDefault: false },
    { id: 'hub-4', category: 'market_hub', name: 'Wagle Industrial Cluster', code: 'WAGLE_HUB', description: 'Commercial and service hub in Thane.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],

  // Payroll & Subscriptions
  incentive_type: [
    { id: 'inc-1', category: 'incentive_type', name: 'Closed Won Deal Commission', code: 'CLOSED_WON_COMM', description: 'Percentage commission on closed deals.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#10B981' },
    { id: 'inc-2', category: 'incentive_type', name: 'High Value Closed Won Bonus', code: 'HIGH_VAL_BONUS', description: 'Special bonus for deals exceeding threshold value.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#3B82F6' },
    { id: 'inc-3', category: 'incentive_type', name: 'Lead Conversion Bonus', code: 'CONV_BONUS', description: 'Flat bonus per qualified lead converted.', sortOrder: 3, isActive: true, isSystemDefault: false, displayColor: '#8B5CF6' },
    { id: 'inc-4', category: 'incentive_type', name: 'Quarterly Sales Champion', code: 'QTR_CHAMP', description: 'Quarterly top performer milestone reward.', sortOrder: 4, isActive: true, isSystemDefault: false, displayColor: '#F59E0B' },
  ],
  allowance_type: [
    { id: 'allow-1', category: 'allowance_type', name: 'House Rent Allowance (HRA)', code: 'HRA', description: 'Statutory house rent component.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'allow-2', category: 'allowance_type', name: 'Conveyance Allowance', code: 'CONVEYANCE', description: 'Fixed monthly commute allowance.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'allow-3', category: 'allowance_type', name: 'Field Fuel Reimbursement', code: 'FUEL_REIMB', description: 'Variable per-km fuel reimbursement.', sortOrder: 3, isActive: true, isSystemDefault: false },
    { id: 'allow-4', category: 'allowance_type', name: 'Mobile & Data Allowance', code: 'MOBILE_DATA', description: 'Monthly connectivity allowance.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],
  deduction_type: [
    { id: 'ded-1', category: 'deduction_type', name: 'Provident Fund (PF)', code: 'PF', description: 'Statutory Provident Fund employee contribution.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'ded-2', category: 'deduction_type', name: 'TDS / Income Tax', code: 'TDS', description: 'Tax deducted at source based on tax slab.', sortOrder: 2, isActive: true, isSystemDefault: true },
    { id: 'ded-3', category: 'deduction_type', name: 'Professional Tax (PT)', code: 'PT', description: 'State professional tax deduction.', sortOrder: 3, isActive: true, isSystemDefault: true },
    { id: 'ded-4', category: 'deduction_type', name: 'Attendance LOP Penalty', code: 'LOP_PENALTY', description: 'Pro-rata deduction for unapproved absences.', sortOrder: 4, isActive: true, isSystemDefault: true },
  ],
  subscription_plan: [
    { id: 'plan-1', category: 'subscription_plan', name: 'Starter Plan (₹5,901/mo)', code: 'STARTER_PLAN', description: 'Basic Google Profile sync and lead management.', sortOrder: 1, isActive: true, isSystemDefault: true, displayColor: '#3B82F6' },
    { id: 'plan-2', category: 'subscription_plan', name: 'Professional Plan (₹12,980/mo)', code: 'PRO_PLAN', description: 'AI review auto-replies, post credits, & website builder.', sortOrder: 2, isActive: true, isSystemDefault: true, displayColor: '#8B5CF6' },
    { id: 'plan-3', category: 'subscription_plan', name: 'Enterprise Growth Plan (₹25,000/mo)', code: 'ENTERPRISE_PLAN', description: 'Multi-store AI suite with dedicated account manager.', sortOrder: 3, isActive: true, isSystemDefault: true, displayColor: '#10B981' },
  ],
};
