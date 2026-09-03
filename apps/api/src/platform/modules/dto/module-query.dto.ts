import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PlatformModuleCategory, PlatformModuleStatus } from '@prisma/client';

export class ModuleQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PlatformModuleCategory)
  category?: PlatformModuleCategory;

  @IsOptional()
  @IsEnum(PlatformModuleStatus)
  status?: PlatformModuleStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sortBy?: string = 'displayOrder';

  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc' = 'asc';
}
