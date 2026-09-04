import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { TenantMembershipStatus, DataScope } from '@prisma/client';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  tenantRoleId?: string;

  @IsEnum(TenantMembershipStatus)
  @IsOptional()
  status?: TenantMembershipStatus = TenantMembershipStatus.ACTIVE;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = false;

  @IsString()
  @IsOptional()
  employeeCode?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsEnum(DataScope)
  @IsOptional()
  dataScope?: DataScope = DataScope.ALL;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  managerMembershipId?: string;

  @IsString()
  @IsOptional()
  invitedByUserId?: string;
}

export class UpdateMembershipStatusDto {
  @IsEnum(TenantMembershipStatus)
  @IsNotEmpty()
  status: TenantMembershipStatus;
}

export class UpdateMembershipProfileDto {
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsEnum(DataScope)
  @IsOptional()
  dataScope?: DataScope;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  managerMembershipId?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
