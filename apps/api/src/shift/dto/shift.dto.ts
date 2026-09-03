import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftSwaggerDto {
  @ApiProperty({
    description: 'Shift name',
    example: 'General Field Shift',
  })
  name: string;

  @ApiProperty({
    description: 'Unique shift code',
    example: 'GEN-01',
  })
  code: string;

  @ApiProperty({
    description: 'Shift start time (HH:mm)',
    example: '09:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'Shift end time (HH:mm)',
    example: '18:00',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Grace period in minutes before mark late',
    default: 15,
  })
  gracePeriodMinutes?: number;

  @ApiPropertyOptional({
    description: 'Half day threshold hours',
    default: 4.5,
  })
  halfDayThresholdHours?: number;

  @ApiPropertyOptional({
    description: 'Break duration in minutes',
    default: 60,
  })
  breakDurationMinutes?: number;
}

export class AssignShiftSwaggerDto {
  @ApiProperty({
    description: 'User ID of employee to assign shift',
    example: 'usr_123abc',
  })
  userId: string;

  @ApiProperty({
    description: 'Shift ID to assign',
    example: 'shf_456def',
  })
  shiftId: string;

  @ApiProperty({
    description: 'Shift assignment start date (YYYY-MM-DD)',
    example: '2026-09-01',
  })
  startDate: string;

  @ApiPropertyOptional({
    description: 'Optional shift assignment end date (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  endDate?: string;
}
