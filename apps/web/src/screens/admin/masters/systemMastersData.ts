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
  group: 'HR & Personnel' | 'Payroll & Finance' | 'Operations & Field' | 'Sales & Pipeline';
  totalLabel: string;
  addTitle: string;
  editTitle: string;
  addLabel: string;
  searchPlaceholder: string;
  defaultCodePrefix: string;
}

export const masterCategories: MasterCategoryConfig[] = [
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
    id: 'incentive_type',
    name: 'Incentive Types',
    description: 'Approved closed won deal commission heads and performance bonus structures.',
    group: 'Payroll & Finance',
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
    group: 'Payroll & Finance',
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
    group: 'Payroll & Finance',
    totalLabel: 'Total Deduction Heads',
    addTitle: 'Add Deduction Head',
    editTitle: 'Edit Deduction Head',
    addLabel: 'Add Deduction',
    searchPlaceholder: 'Search deduction rules...',
    defaultCodePrefix: 'DED',
  },
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
  {
    id: 'lead_stage',
    name: 'Lead Stages & Pipeline',
    description: 'CRM conversion funnel stages from initial lead contact to closed won.',
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
];

export const initialMasterRecords: Record<string, MasterRecordItem[]> = {
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
  territory: [
    { id: 'terr-1', category: 'territory', name: 'Andheri & BKC Zone', code: 'ANDHERI_BKC', description: 'Key commercial hub and office parks.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'terr-2', category: 'territory', name: 'Powai Tech Belt', code: 'POWAI_TECH', description: 'Tech parks and corporate towers.', sortOrder: 2, isActive: true, isSystemDefault: false },
    { id: 'terr-3', category: 'territory', name: 'Thane Belapur Road', code: 'THANE_BELAPUR', description: 'Industrial and IT corridor.', sortOrder: 3, isActive: true, isSystemDefault: false },
  ],
  expense_category: [
    { id: 'exp-1', category: 'expense_category', name: 'Fuel & Commute', code: 'FUEL', description: 'Field travel fuel expenses.', sortOrder: 1, isActive: true, isSystemDefault: true },
    { id: 'exp-2', category: 'expense_category', name: 'Client Lunch & Hospitality', code: 'CLIENT_MEET', description: 'Prospect meeting expenses.', sortOrder: 3, isActive: true, isSystemDefault: true },
    { id: 'exp-3', category: 'expense_category', name: 'Toll & Parking Fees', code: 'TOLL_PARKING', description: 'Highway tolls and commercial parking.', sortOrder: 4, isActive: true, isSystemDefault: false },
  ],
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
};
