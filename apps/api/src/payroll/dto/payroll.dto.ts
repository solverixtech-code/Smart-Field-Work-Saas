import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateSalaryStructureSwaggerDto {
  @ApiProperty({
    description: 'Target Membership ID of employee',
    example: 'mem_123abc',
  })
  @IsString()
  @IsNotEmpty()
  membershipId: string;

  @ApiProperty({
    description: 'Monthly base salary amount in INR',
    example: 45000,
  })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiPropertyOptional({
    description: 'House Rent Allowance (HRA) amount',
    example: 18000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hra?: number;

  @ApiPropertyOptional({
    description: 'Conveyance allowance amount',
    example: 2000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  conveyance?: number;

  @ApiPropertyOptional({
    description: 'Other special allowances',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @ApiPropertyOptional({
    description: 'Provident Fund (PF) deduction',
    example: 5400,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pfDeduction?: number;

  @ApiPropertyOptional({
    description: 'ESI deduction amount',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  esiDeduction?: number;

  @ApiPropertyOptional({
    description: 'Tax Deducted at Source (TDS)',
    example: 1500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tds?: number;
}

export class GeneratePayrollSwaggerDto {
  @ApiProperty({
    description: 'Month number (1 to 12)',
    example: 9,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: 'Year',
    example: 2026,
  })
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;
}

export class MarkPayslipPaidSwaggerDto {
  @ApiPropertyOptional({
    description: 'Bank payment transaction reference number',
    example: 'TXN-9876543210',
  })
  @IsOptional()
  @IsString()
  transactionRef?: string;
}
