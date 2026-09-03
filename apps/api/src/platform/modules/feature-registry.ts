import {
  ModuleFeatureStatus,
  PlatformModuleCategory,
  PlatformModuleStatus,
} from '@prisma/client';

export interface RegisteredFeature {
  readonly moduleCode: string;
  readonly code: string;
  readonly implementationKey: string;
  readonly name: string;
  readonly description: string;
  readonly status: ModuleFeatureStatus;
  readonly supportsWeb: boolean;
  readonly supportsMobile: boolean;
  readonly supportsApi: boolean;
  readonly supportsOffline: boolean;
  readonly displayOrder: number;
}

export interface RegisteredModule {
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: PlatformModuleCategory;
  readonly status: PlatformModuleStatus;
  readonly requiredBySystem: boolean;
  readonly displayOrder: number;
  readonly dependencyCodes?: readonly string[];
}

// This registry is deliberately limited to capabilities with corresponding API
// modules or routed product screens in this repository.
export const MODULE_REGISTRY: readonly RegisteredModule[] = [
  { code: 'core_crm', name: 'Core CRM & Lead Management', description: 'Lead, business, pipeline and follow-up management.', category: PlatformModuleCategory.CORE, status: PlatformModuleStatus.ACTIVE, requiredBySystem: true, displayOrder: 1 },
  { code: 'field_visits', name: 'Field Visits', description: 'Scheduled visits, GPS exceptions and route playback.', category: PlatformModuleCategory.FIELD_OPS, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 2, dependencyCodes: ['core_crm'] },
  { code: 'attendance', name: 'Attendance & Shifts', description: 'Shift configuration and attendance monitoring.', category: PlatformModuleCategory.FIELD_OPS, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 3 },
  { code: 'payroll', name: 'Payroll & Incentives', description: 'Payroll processing, targets and incentive management.', category: PlatformModuleCategory.ENTERPRISE, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 4, dependencyCodes: ['attendance'] },
  { code: 'demo_scheduler', name: 'Demo Management', description: 'Demo scheduling, completion and reporting.', category: PlatformModuleCategory.SALES, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 5, dependencyCodes: ['core_crm'] },
];

export const FEATURE_REGISTRY: readonly RegisteredFeature[] = [
  { moduleCode: 'core_crm', code: 'lead_management', implementationKey: 'core_crm.lead_management', name: 'Lead Management', description: 'Lead list, capture, editing and assignment workflows.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1 },
  { moduleCode: 'core_crm', code: 'business_management', implementationKey: 'core_crm.business_management', name: 'Business Management', description: 'Business records, contact details and visit history.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 2 },
  { moduleCode: 'core_crm', code: 'sales_pipeline', implementationKey: 'core_crm.sales_pipeline', name: 'Sales Pipeline', description: 'Pipeline and sales-stage workspace.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 3 },
  { moduleCode: 'field_visits', code: 'visit_scheduling', implementationKey: 'field_visits.visit_scheduling', name: 'Visit Scheduling', description: 'Create, manage and inspect field visits.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1 },
  { moduleCode: 'field_visits', code: 'gps_exception_review', implementationKey: 'field_visits.gps_exception_review', name: 'GPS Exception Review', description: 'Review GPS exceptions and route playback.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 2 },
  { moduleCode: 'attendance', code: 'shift_management', implementationKey: 'attendance.shift_management', name: 'Shift Management', description: 'Configure shifts and schedule rules.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1 },
  { moduleCode: 'attendance', code: 'attendance_monitoring', implementationKey: 'attendance.monitoring', name: 'Attendance Monitoring', description: 'Monitor employee attendance records.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 2 },
  { moduleCode: 'payroll', code: 'payroll_management', implementationKey: 'payroll.management', name: 'Payroll Management', description: 'Manage payroll records and processing.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1 },
  { moduleCode: 'payroll', code: 'incentive_rules', implementationKey: 'payroll.incentive_rules', name: 'Incentive Rules', description: 'Configure incentive rules and payouts.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 2 },
  { moduleCode: 'demo_scheduler', code: 'demo_scheduling', implementationKey: 'demo_scheduler.scheduling', name: 'Demo Scheduling', description: 'Schedule and manage product demos.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1 },
];
