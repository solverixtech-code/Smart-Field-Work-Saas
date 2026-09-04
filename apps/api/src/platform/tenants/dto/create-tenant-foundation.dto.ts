import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Matches,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus, TenantAddressType } from '@prisma/client';

export class TenantAddressInputDto {
  @IsEnum(TenantAddressType)
  @IsOptional()
  type?: TenantAddressType = TenantAddressType.REGISTERED;

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  stateOrRegion?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'countryCode must be a 2-letter ISO country code (e.g. IN, US)' })
  @IsOptional()
  countryCode?: string = 'IN';

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = true;
}

export class TenantSettingsInputDto {
  @IsString()
  @IsOptional()
  timezone?: string = 'Asia/Kolkata';

  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO 4217 currency code (e.g. INR, USD)' })
  @IsOptional()
  currency?: string = 'INR';

  @IsString()
  @IsOptional()
  locale?: string = 'en-IN';

  @IsString()
  @IsOptional()
  language?: string = 'en';

  @IsString()
  @IsOptional()
  dateFormat?: string = 'YYYY-MM-DD';

  @IsString()
  @IsOptional()
  weekStartDay?: string = 'MONDAY';

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  financialYearStartMonth?: number = 4;
}

export class TenantBrandingInputDto {
  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'primaryColor must be a valid hex color code (e.g. #0D1F3D)' })
  @IsOptional()
  primaryColor?: string = '#0D1F3D';

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'secondaryColor must be a valid hex color code (e.g. #4F46E5)' })
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsBoolean()
  @IsOptional()
  showLogoOnLogin?: boolean = false;
}

export class CreateTenantFoundationDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, URL-safe snake-kebab format (e.g. abc-pharma)',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  primaryDomain?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus = TenantStatus.DRAFT;

  @IsString()
  @IsOptional()
  companySizeCode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => TenantAddressInputDto)
  @IsOptional()
  address?: TenantAddressInputDto;

  @ValidateNested()
  @Type(() => TenantSettingsInputDto)
  @IsOptional()
  settings?: TenantSettingsInputDto;

  @ValidateNested()
  @Type(() => TenantBrandingInputDto)
  @IsOptional()
  branding?: TenantBrandingInputDto;
}
