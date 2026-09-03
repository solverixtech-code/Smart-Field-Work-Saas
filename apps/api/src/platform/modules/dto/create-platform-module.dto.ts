import {
  IsString,
  IsNotEmpty,
  Matches,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformModuleCategory, PlatformModuleStatus } from '@prisma/client';

export class CreatePlatformModuleDto {
  @ApiProperty({
    description: 'Unique module code in lowercase snake_case',
    example: 'order_management',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Module code must be lowercase snake_case starting with a letter',
  })
  code: string;

  @ApiProperty({
    description: 'Module display title',
    example: 'Field Order Booking & Invoicing',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Module functional description',
    example: 'Primary & secondary order booking, SKU price books, GST tax invoices & dealer ledgers.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: PlatformModuleCategory,
    description: 'Module platform category classification',
    example: 'SALES',
  })
  @IsEnum(PlatformModuleCategory)
  category: PlatformModuleCategory;

  @ApiPropertyOptional({
    enum: PlatformModuleStatus,
    description: 'Module initial lifecycle status',
    default: PlatformModuleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PlatformModuleStatus)
  status?: PlatformModuleStatus = PlatformModuleStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Whether this module is system-required and protected from archiving',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiredBySystem?: boolean = false;

  @ApiPropertyOptional({
    description: 'Sort display order in platform catalog',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  displayOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Internal admin notes',
    example: 'Coded capability package for sales reps',
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of prerequisite module codes required by this module',
    example: ['core_crm'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencyCodes?: string[];
}
