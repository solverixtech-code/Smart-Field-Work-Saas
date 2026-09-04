import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateShiftSwaggerDto {
  @ApiProperty({
    description: 'Shift name',
    example: 'General Field Shift',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique shift code within tenant',
    example: 'GEN-01',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Shift start time (HH:mm)',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Shift end time (HH:mm)',
    example: '18:00',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Grace period in minutes before mark late',
    default: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  gracePeriodMinutes?: number;

  @ApiPropertyOptional({
    description: 'Half day threshold hours',
    default: 4.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  halfDayThresholdHours?: number;

  @ApiPropertyOptional({
    description: 'Break duration in minutes',
    default: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(240)
  breakDurationMinutes?: number;
}

export class UpdateShiftSwaggerDto {
  @ApiPropertyOptional({ description: 'Shift name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Shift code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Shift start time (HH:mm)' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Shift end time (HH:mm)' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Grace period in minutes' })
  @IsOptional()
  @IsNumber()
  gracePeriodMinutes?: number;

  @ApiPropertyOptional({ description: 'Half day threshold hours' })
  @IsOptional()
  @IsNumber()
  halfDayThresholdHours?: number;

  @ApiPropertyOptional({ description: 'Break duration in minutes' })
  @IsOptional()
  @IsNumber()
  breakDurationMinutes?: number;
}

export class AssignShiftSwaggerDto {
  @ApiProperty({
    description: 'Target Membership ID of employee',
    example: 'mem_123abc',
  })
  @IsString()
  @IsNotEmpty()
  membershipId: string;

  @ApiProperty({
    description: 'Shift ID to assign',
    example: 'shf_456def',
  })
  @IsString()
  @IsNotEmpty()
  shiftId: string;

  @ApiProperty({
    description: 'Shift assignment start date (YYYY-MM-DD)',
    example: '2026-09-01',
  })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'Optional shift assignment end date (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
