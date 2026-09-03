import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryStructureSwaggerDto {
  @ApiProperty({
    description: 'User ID for employee salary structure',
    example: 'usr_123abc',
  })
  userId: string;

  @ApiProperty({
    description: 'Monthly base salary amount in INR',
    example: 45000,
  })
  baseSalary: number;

  @ApiPropertyOptional({
    description: 'House Rent Allowance (HRA) amount',
    example: 18000,
  })
  hra?: number;

  @ApiPropertyOptional({
    description: 'Conveyance allowance amount',
    example: 2000,
  })
  conveyance?: number;

  @ApiPropertyOptional({
    description: 'Other special allowances',
    example: 5000,
  })
  allowances?: number;

  @ApiPropertyOptional({
    description: 'Provident Fund (PF) deduction',
    example: 5400,
  })
  pfDeduction?: number;

  @ApiPropertyOptional({
    description: 'ESI deduction amount',
    example: 0,
  })
  esiDeduction?: number;

  @ApiPropertyOptional({
    description: 'Tax Deducted at Source (TDS)',
    example: 1500,
  })
  tds?: number;
}

export class GeneratePayrollSwaggerDto {
  @ApiProperty({
    description: 'Month number (1 to 12)',
    example: 9,
  })
  month: number;

  @ApiProperty({
    description: 'Year',
    example: 2026,
  })
  year: number;
}

export class MarkPayslipPaidSwaggerDto {
  @ApiPropertyOptional({
    description: 'Bank payment transaction reference number',
    example: 'TXN-9876543210',
  })
  transactionRef?: string;
}
