import { IsString, IsOptional, IsEnum, IsBoolean, IsInt } from 'class-validator';
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
  @IsBoolean()
  platformSupport?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
