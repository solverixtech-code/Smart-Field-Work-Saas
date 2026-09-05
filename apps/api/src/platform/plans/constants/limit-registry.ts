export enum LimitValueTypeEnum {
  INTEGER = 'INTEGER',
  DECIMAL = 'DECIMAL',
  BOOLEAN = 'BOOLEAN',
}

export interface LimitDefinition {
  code: string;
  name: string;
  valueType: LimitValueTypeEnum;
  unit?: string;
  description: string;
}

export const PLAN_LIMIT_REGISTRY: Record<string, LimitDefinition> = {
  minimum_seats: {
    code: 'minimum_seats',
    name: 'Minimum Seats',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'seats',
    description: 'Minimum seat requirement for plan purchase',
  },
  default_seat_limit: {
    code: 'default_seat_limit',
    name: 'Default Seat Limit',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'seats',
    description: 'Default seats included without additional seat purchases',
  },
  maximum_seats: {
    code: 'maximum_seats',
    name: 'Maximum Seats',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'seats',
    description: 'Upper boundary for seats (unlimited if marked isUnlimited)',
  },
  seat_increment: {
    code: 'seat_increment',
    name: 'Seat Increment',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'seats',
    description: 'Seat step increment for bulk additions',
  },
  storage_gb: {
    code: 'storage_gb',
    name: 'Storage Allowance',
    valueType: LimitValueTypeEnum.DECIMAL,
    unit: 'GB',
    description: 'Total tenant cloud file storage limit',
  },
  storage_increment_gb: {
    code: 'storage_increment_gb',
    name: 'Storage Increment',
    valueType: LimitValueTypeEnum.DECIMAL,
    unit: 'GB',
    description: 'Storage add-on step allocation',
  },
  data_retention_days: {
    code: 'data_retention_days',
    name: 'Data Retention',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'days',
    description: 'Operational history retention window',
  },
  api_requests_per_month: {
    code: 'api_requests_per_month',
    name: 'API Requests Limit',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'requests/mo',
    description: 'Monthly developer API endpoint quota',
  },
  active_workflows: {
    code: 'active_workflows',
    name: 'Active Workflows',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'workflows',
    description: 'Maximum active automation workflows',
  },
  custom_forms: {
    code: 'custom_forms',
    name: 'Custom Forms',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'forms',
    description: 'Maximum custom field collection forms',
  },
  report_exports_per_month: {
    code: 'report_exports_per_month',
    name: 'Report Exports Limit',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'exports/mo',
    description: 'Monthly analytics data exports',
  },
  file_upload_mb: {
    code: 'file_upload_mb',
    name: 'Max File Upload Size',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'MB',
    description: 'Maximum size limit for individual media upload',
  },
  ai_credits_per_month: {
    code: 'ai_credits_per_month',
    name: 'AI Credits',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'credits/mo',
    description: 'Monthly AI query/generation credit allocation',
  },
  automations_per_month: {
    code: 'automations_per_month',
    name: 'Automations Limit',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'runs/mo',
    description: 'Monthly automation execution runs',
  },
  email_sends_per_month: {
    code: 'email_sends_per_month',
    name: 'Email Send Quota',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'emails/mo',
    description: 'Monthly transactional email send allocation',
  },
  offline_data_gb_per_device: {
    code: 'offline_data_gb_per_device',
    name: 'Offline Storage Limit',
    valueType: LimitValueTypeEnum.DECIMAL,
    unit: 'GB/device',
    description: 'Mobile app offline cache database size limit',
  },
  concurrent_sessions: {
    code: 'concurrent_sessions',
    name: 'Concurrent Sessions',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'sessions',
    description: 'Simultaneous active session limit per user',
  },
  full_data_export: {
    code: 'full_data_export',
    name: 'Full Data Export',
    valueType: LimitValueTypeEnum.BOOLEAN,
    description: 'Enables complete automated tenant database backups export',
  },
  audit_retention_days: {
    code: 'audit_retention_days',
    name: 'Audit Log Retention',
    valueType: LimitValueTypeEnum.INTEGER,
    unit: 'days',
    description: 'Security & compliance audit log retention window',
  },
};
