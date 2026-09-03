import { IsArray, IsString } from 'class-validator';

export class UpdateModuleDependenciesDto {
  @IsArray()
  @IsString({ each: true })
  dependencyCodes: string[];
}
