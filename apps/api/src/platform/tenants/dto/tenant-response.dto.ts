import { TenantStatus, TenantAddressType } from '@prisma/client';

export interface TenantAddressDto {
  id: string;
  type: TenantAddressType;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  stateOrRegion?: string | null;
  postalCode?: string | null;
  countryCode: string;
  isPrimary: boolean;
}

export interface TenantSettingsDto {
  timezone: string;
  currency: string;
  locale: string;
  language: string;
  dateFormat: string;
  weekStartDay: string;
  financialYearStartMonth: number;
  configVersion: number;
}

export interface TenantBrandingDto {
  shortName?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  logoUrl?: string | null;
  showLogoOnLogin: boolean;
}

export interface TenantSummaryDto {
  id: string;
  slug: string;
  displayName: string;
  legalName?: string | null;
  primaryDomain?: string | null;
  websiteUrl?: string | null;
  status: TenantStatus;
  companySizeCode?: string | null;
  membershipCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDetailDto extends TenantSummaryDto {
  description?: string | null;
  activatedAt?: string | null;
  suspendedAt?: string | null;
  cancelledAt?: string | null;
  archivedAt?: string | null;
  addresses: TenantAddressDto[];
  settings?: TenantSettingsDto | null;
  branding?: TenantBrandingDto | null;
}

export interface PaginatedTenantResponseDto {
  data: TenantSummaryDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
