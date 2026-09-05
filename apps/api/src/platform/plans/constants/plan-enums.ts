export enum PlanStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum PlanVisibilityEnum {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  INVITE_ONLY = 'INVITE_ONLY',
}

export enum PlanVersionStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum PricingModelEnum {
  PER_USER = 'PER_USER',
  BASE_PLUS_PER_USER = 'BASE_PLUS_PER_USER',
  FLAT = 'FLAT',
  CUSTOM_CONTRACT = 'CUSTOM_CONTRACT',
}

export enum BillingCycleEnum {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export enum TaxModeEnum {
  EXCLUSIVE = 'EXCLUSIVE',
  INCLUSIVE = 'INCLUSIVE',
}

export enum ProrationPolicyEnum {
  NONE = 'NONE',
  IMMEDIATE = 'IMMEDIATE',
  NEXT_BILLING_CYCLE = 'NEXT_BILLING_CYCLE',
}

export enum ExpiryAccessEnum {
  READ_ONLY = 'READ_ONLY',
  BLOCKED = 'BLOCKED',
}

export enum ChangeEffectiveTimingEnum {
  IMMEDIATE = 'IMMEDIATE',
  NEXT_BILLING_CYCLE = 'NEXT_BILLING_CYCLE',
}
