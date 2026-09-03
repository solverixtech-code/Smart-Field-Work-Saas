import {
  ModuleFeatureStatus,
  PlatformModuleCategory,
  PlatformModuleStatus,
} from '@prisma/client';

export enum FeatureImplementationMaturity {
  DECLARED = 'DECLARED',
  UI_READY = 'UI_READY',
  BACKEND_PARTIAL = 'BACKEND_PARTIAL',
  BACKEND_READY = 'BACKEND_READY',
  FULL_STACK_READY = 'FULL_STACK_READY',
}

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
  readonly maturity: FeatureImplementationMaturity;
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

export const MODULE_REGISTRY: readonly RegisteredModule[] = [
  { code: 'core_crm', name: 'Core CRM & Lead Management', description: 'Lead capture, pipeline stages, lead assignment, territory routing & account management.', category: PlatformModuleCategory.CORE, status: PlatformModuleStatus.ACTIVE, requiredBySystem: true, displayOrder: 1 },
  { code: 'field_visits', name: 'GPS Field Visit Tracking', description: 'Scheduled visits, geofenced check-ins, route playback, PJP beat planner & field audits.', category: PlatformModuleCategory.FIELD_OPS, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 2, dependencyCodes: ['core_crm'] },
  { code: 'attendance', name: 'Attendance & Shifts', description: 'Shift configuration, attendance monitoring, face biometric clock-in & muster roll.', category: PlatformModuleCategory.FIELD_OPS, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 3 },
  { code: 'payroll', name: 'Payroll & Incentives', description: 'Payroll processing, TA/DA travel allowances, sales incentives & PDF payslips.', category: PlatformModuleCategory.ENTERPRISE, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 4, dependencyCodes: ['attendance'] },
  { code: 'demo_scheduler', name: 'Demo Management', description: 'Demo appointment scheduling, collateral presentation vault & client sign-off.', category: PlatformModuleCategory.SALES, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 5, dependencyCodes: ['core_crm'] },
  { code: 'order_management', name: 'Field Order Booking & Invoicing', description: 'Primary & secondary order booking, SKU price books, GST tax invoices & dealer ledgers.', category: PlatformModuleCategory.SALES, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 6, dependencyCodes: ['core_crm'] },
  { code: 'whatsapp_automation', name: 'WhatsApp & Meta Lead Sync', description: 'Official WhatsApp Cloud API auto-responder, Meta lead ads sync & template broadcasts.', category: PlatformModuleCategory.AUTOMATION, status: PlatformModuleStatus.ACTIVE, requiredBySystem: false, displayOrder: 7 },
  { code: 'ai_copilot', name: 'AI Sales Copilot & Target Coach', description: 'AI next best action, call note summarizer & predictive deal closure coach.', category: PlatformModuleCategory.AUTOMATION, status: PlatformModuleStatus.BETA, requiredBySystem: false, displayOrder: 8, dependencyCodes: ['core_crm'] },
];

export const FEATURE_REGISTRY: readonly RegisteredFeature[] = [
  // 1. Core CRM
  { moduleCode: 'core_crm', code: 'lead_management', implementationKey: 'core_crm.lead_management', name: 'Lead Management', description: 'Lead list, capture, editing and assignment workflows.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 1, maturity: FeatureImplementationMaturity.FULL_STACK_READY },
  { moduleCode: 'core_crm', code: 'business_management', implementationKey: 'core_crm.business_management', name: 'Business Management', description: 'Business records, contact details and visit history.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 2, maturity: FeatureImplementationMaturity.FULL_STACK_READY },
  { moduleCode: 'core_crm', code: 'sales_pipeline', implementationKey: 'core_crm.sales_pipeline', name: 'Sales Pipeline Workspace', description: 'Customizable lead status workflow & deal stages workspace.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 3, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'core_crm', code: 'auto_routing', implementationKey: 'core_crm.auto_routing', name: 'Auto-Routing & Lead Assignment', description: 'Rule-based lead routing & automatic assignment to field reps.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 4, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'core_crm', code: 'territory_management', implementationKey: 'core_crm.territory_management', name: 'Territory Hierarchy & Boundary Mapping', description: 'Define sales territories, pincodes, geofence boundaries & executive mapping.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 5, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'core_crm', code: 'contact_manager', implementationKey: 'core_crm.contact_manager', name: 'Account & Contact Management', description: 'Unified customer account profiles & key contact directory.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 6, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'core_crm', code: 'activity_timeline', implementationKey: 'core_crm.activity_timeline', name: 'Activity Log & Notes', description: 'Chronological timeline of calls, emails & field meeting notes.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 7, maturity: FeatureImplementationMaturity.UI_READY },

  // 2. Field Visits
  { moduleCode: 'field_visits', code: 'visit_scheduling', implementationKey: 'field_visits.visit_scheduling', name: 'Visit Scheduling & Inspection', description: 'Create, manage and inspect field visits.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 1, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'field_visits', code: 'gps_exception_review', implementationKey: 'field_visits.gps_exception_review', name: 'GPS Exception Review', description: 'Review GPS exceptions, location tampering & route playback.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 2, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'field_visits', code: 'geofence_checkin', implementationKey: 'field_visits.geofence_checkin', name: 'Geofenced Check-In & Check-Out', description: 'Location-verified GPS check-ins at client site.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 3, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'field_visits', code: 'route_playback', implementationKey: 'field_visits.route_playback', name: 'GPS Route Map Playback', description: 'Real-time breadcrumb route tracking & distance log.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 4, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'field_visits', code: 'visit_proof', implementationKey: 'field_visits.visit_proof', name: 'Photo & Document Proof', description: 'Mandatory photo capture & client signature attachment.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 5, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'field_visits', code: 'beat_planner', implementationKey: 'field_visits.beat_planner', name: 'Beat & PJP Route Planner', description: 'Permanent Journey Plan (PJP) & daily beat schedule.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 6, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'field_visits', code: 'site_surveys', implementationKey: 'field_visits.site_surveys', name: 'Custom Field Forms & Audits', description: 'Dynamic audit checklists, site survey & store audit forms.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 7, maturity: FeatureImplementationMaturity.UI_READY },

  // 3. Attendance & Shifts
  { moduleCode: 'attendance', code: 'shift_management', implementationKey: 'attendance.shift_management', name: 'Shift Management', description: 'Configure shifts, grace periods and penalty rules.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1, maturity: FeatureImplementationMaturity.FULL_STACK_READY },
  { moduleCode: 'attendance', code: 'attendance_monitoring', implementationKey: 'attendance.monitoring', name: 'Attendance Monitoring', description: 'Monitor employee attendance records & punch logs.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 2, maturity: FeatureImplementationMaturity.FULL_STACK_READY },
  { moduleCode: 'attendance', code: 'face_biometric', implementationKey: 'attendance.face_biometric', name: 'AI Selfie & Face Verification', description: 'Liveness detection selfie clock-in to eliminate buddy punching.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 3, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'attendance', code: 'muster_roll', implementationKey: 'attendance.muster_roll', name: 'Automated Muster Roll Reports', description: 'Monthly attendance summary exportable for HR processing.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 4, maturity: FeatureImplementationMaturity.FULL_STACK_READY },

  // 4. Payroll & Incentives
  { moduleCode: 'payroll', code: 'payroll_management', implementationKey: 'payroll.management', name: 'Payroll Management', description: 'Manage payroll records and processing.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1, maturity: FeatureImplementationMaturity.FULL_STACK_READY },
  { moduleCode: 'payroll', code: 'incentive_rules', implementationKey: 'payroll.incentive_rules', name: 'Incentive Rules & Slabs', description: 'Configure incentive rules, target slabs and payouts.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 2, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'payroll', code: 'allowance_tada', implementationKey: 'payroll.allowance_tada', name: 'TA/DA Travel Allowance Engine', description: 'Per-km travel reimbursement & daily food allowance calculation.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 3, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'payroll', code: 'payslip_generator', implementationKey: 'payroll.payslip_generator', name: 'PDF Payslip Generator', description: 'One-click salary processing & employee portal PDF distribution.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 4, maturity: FeatureImplementationMaturity.FULL_STACK_READY },

  // 5. Demo Scheduler
  { moduleCode: 'demo_scheduler', code: 'demo_scheduling', implementationKey: 'demo_scheduler.scheduling', name: 'Demo Scheduling', description: 'Schedule and manage product demos & SMS reminders.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 1, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'demo_scheduler', code: 'collateral_vault', implementationKey: 'demo_scheduler.collateral_vault', name: 'Product Presentation Vault', description: 'Offline-capable brochure, video & PDF collateral viewer.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 2, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'demo_scheduler', code: 'client_signoff', implementationKey: 'demo_scheduler.client_signoff', name: 'Digital Client Sign-off', description: 'On-screen client rating & digital agreement signature.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 3, maturity: FeatureImplementationMaturity.UI_READY },

  // 6. Field Order Booking
  { moduleCode: 'order_management', code: 'primary_secondary_booking', implementationKey: 'order_management.primary_secondary_booking', name: 'Primary & Secondary Order Booking', description: 'Distributor & retailer purchase order creation.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 1, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'order_management', code: 'product_catalog', implementationKey: 'order_management.product_catalog', name: 'SKU Price Books & Discounts', description: 'Tiered price lists, schemes & promotional discounts.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: true, displayOrder: 2, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'order_management', code: 'tax_invoice', implementationKey: 'order_management.tax_invoice', name: 'GST Tax Invoice PDF', description: 'Instant PDF invoice generation & WhatsApp sharing.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 3, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'order_management', code: 'dealer_ledger', implementationKey: 'order_management.dealer_ledger', name: 'Dealer Credit & Payment Collection', description: 'Outstanding ledger balances & payment receipt entry.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 4, maturity: FeatureImplementationMaturity.UI_READY },

  // 7. WhatsApp & Meta Lead Sync
  { moduleCode: 'whatsapp_automation', code: 'meta_lead_sync', implementationKey: 'whatsapp_automation.meta_lead_sync', name: 'Facebook & Instagram Lead Sync', description: 'Instant auto-import of leads from Meta Lead Gen Ads.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 1, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'whatsapp_automation', code: 'whatsapp_bot', implementationKey: 'whatsapp_automation.whatsapp_bot', name: 'WhatsApp Cloud API Auto-Responder', description: 'Official WhatsApp Business API interactive chatbot.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 2, maturity: FeatureImplementationMaturity.UI_READY },
  { moduleCode: 'whatsapp_automation', code: 'template_broadcast', implementationKey: 'whatsapp_automation.template_broadcast', name: 'Approved Template Broadcasts', description: 'Bulk marketing campaigns & template message tracking.', status: ModuleFeatureStatus.ACTIVE, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 3, maturity: FeatureImplementationMaturity.UI_READY },

  // 8. AI Sales Copilot
  { moduleCode: 'ai_copilot', code: 'next_best_action', implementationKey: 'ai_copilot.next_best_action', name: 'AI Recommended Next Best Action', description: 'Intelligent daily visit prioritization for maximum conversion.', status: ModuleFeatureStatus.BETA, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 1, maturity: FeatureImplementationMaturity.DECLARED },
  { moduleCode: 'ai_copilot', code: 'visit_summary_ai', implementationKey: 'ai_copilot.visit_summary_ai', name: 'Voice & Call Notes Summarizer', description: 'AI transcription & automated key takeaway extraction.', status: ModuleFeatureStatus.BETA, supportsWeb: true, supportsMobile: true, supportsApi: true, supportsOffline: false, displayOrder: 2, maturity: FeatureImplementationMaturity.DECLARED },
  { moduleCode: 'ai_copilot', code: 'target_coaching', implementationKey: 'ai_copilot.target_coaching', name: 'Sales Target & Churn Predictor', description: 'Predictive analytics on deal closure probability & churn risk.', status: ModuleFeatureStatus.BETA, supportsWeb: true, supportsMobile: false, supportsApi: true, supportsOffline: false, displayOrder: 3, maturity: FeatureImplementationMaturity.DECLARED },
];
