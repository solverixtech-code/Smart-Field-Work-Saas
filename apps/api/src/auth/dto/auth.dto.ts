import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginSwaggerDto {
  @ApiPropertyOptional({
    description: 'Username or email address (used by Swagger OAuth2 & standard login)',
    example: 'amit.sharma@visibloai.com',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Email address or employee code',
    example: 'amit.sharma@visibloai.com',
  })
  emailOrCode?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'amit.sharma@visibloai.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Employee code',
    example: 'VIS-SA-001',
  })
  employeeCode?: string;

  @ApiProperty({
    description: 'User account password',
    example: 'Visiblo@2025',
  })
  password: string;
}

export class OtpVerifySwaggerDto {
  @ApiProperty({
    description: 'Challenge token returned by POST /auth/login when OTP 2FA is enabled',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  challengeToken: string;

  @ApiProperty({
    description: '6-digit OTP code received via SMS/Email',
    example: '123456',
  })
  otp: string;
}

export class OtpResendSwaggerDto {
  @ApiProperty({
    description: 'Challenge token returned during initial login attempt',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  challengeToken: string;
}

export class RefreshTokenSwaggerDto {
  @ApiProperty({
    description: 'Valid refresh token issued upon successful authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class ForgotPasswordSwaggerDto {
  @ApiProperty({
    description: 'Email address or employee code associated with user account',
    example: 'amit.sharma@visibloai.com',
  })
  emailOrCode: string;
}

export class ResetPasswordSwaggerDto {
  @ApiProperty({
    description: 'Password reset token delivered via email',
    example: 'reset_token_abc123',
  })
  token: string;

  @ApiProperty({
    description: 'New password for the account',
    example: 'NewSecurePassword@2026',
  })
  newPassword: string;
}

export class ChangePasswordSwaggerDto {
  @ApiProperty({
    description: 'Current active account password',
    example: 'Visiblo@2025',
  })
  currentPassword: string;

  @ApiProperty({
    description: 'New password to replace current password',
    example: 'UpdatedPassword@2026',
  })
  newPassword: string;
}

export class UpdateProfileSwaggerDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'Amit Sharma',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Contact mobile number',
    example: '+919876543210',
  })
  mobile?: string;

  @ApiPropertyOptional({
    description: 'Date of birth in YYYY-MM-DD format',
    example: '1990-08-15',
  })
  dateOfBirth?: string | null;

  @ApiPropertyOptional({
    description: 'User office address',
    example: 'Andheri East, Mumbai, Maharashtra, India',
  })
  officeAddress?: string | null;

  @ApiPropertyOptional({
    description: 'Designation in the currently selected workspace',
    example: 'Field Executive',
  })
  designation?: string | null;
}

export class AvatarUploadSwaggerDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (JPEG, PNG, WebP, max 5MB)',
  })
  file: any;
}
