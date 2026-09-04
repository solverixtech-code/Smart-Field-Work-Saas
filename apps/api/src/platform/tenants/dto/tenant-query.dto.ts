import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus } from '@prisma/client';

export enum TenantSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DISPLAY_NAME = 'displayName',
  STATUS = 'status',
  SLUG = 'slug',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class TenantQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsEnum(TenantSortField)
  @IsOptional()
  sortBy?: TenantSortField = TenantSortField.CREATED_AT;

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection?: SortDirection = SortDirection.DESC;
}
