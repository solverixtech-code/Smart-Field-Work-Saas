import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformModuleCategory, PlatformModuleStatus } from '@prisma/client';

export class ModuleQueryDto {
  @ApiPropertyOptional({
    description: 'Search string for module name, code, or description',
    example: 'crm',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: PlatformModuleCategory,
    description: 'Filter modules by category',
  })
  @IsOptional()
  @IsEnum(PlatformModuleCategory)
  category?: PlatformModuleCategory;

  @ApiPropertyOptional({
    enum: PlatformModuleStatus,
    description: 'Filter modules by lifecycle status',
  })
  @IsOptional()
  @IsEnum(PlatformModuleStatus)
  status?: PlatformModuleStatus;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Field to sort results by',
    default: 'displayOrder',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'displayOrder';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order direction',
    default: 'asc',
  })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc' = 'asc';
}
