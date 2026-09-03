import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ModuleFeatureStatus } from '@prisma/client';

export class UpdateModuleFeatureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ModuleFeatureStatus)
  status?: ModuleFeatureStatus;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
