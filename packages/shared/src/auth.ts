import { z } from 'zod';

// ─── Roles ──────────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'SALES_MANAGER',
  'TEAM_LEADER',
  'FIELD_EXECUTIVE',
  'TELECALLER',
  'SALES_EXECUTIVE',
  'EXECUTIVE',
  'FINANCE_OPS',
  'SUPPORT',

  'PLATFORM_SUPER_ADMIN',
  'PLATFORM_OPERATIONS_ADMIN',
  'PLATFORM_ONBOARDING',
  'PLATFORM_SUPPORT',
  'PLATFORM_BILLING',
  'PLATFORM_AUDITOR',
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  TEAM_LEADER: 'TEAM_LEADER',
  FIELD_EXECUTIVE: 'FIELD_EXECUTIVE',
  TELECALLER: 'TELECALLER',
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
  EXECUTIVE: 'EXECUTIVE',
  FINANCE_OPS: 'FINANCE_OPS',
  SUPPORT: 'SUPPORT',

  PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
  PLATFORM_OPERATIONS_ADMIN: 'PLATFORM_OPERATIONS_ADMIN',
  PLATFORM_ONBOARDING: 'PLATFORM_ONBOARDING',
  PLATFORM_SUPPORT: 'PLATFORM_SUPPORT',
  PLATFORM_BILLING: 'PLATFORM_BILLING',
  PLATFORM_AUDITOR: 'PLATFORM_AUDITOR',
} as const;

export type Role = UserRole;

export function getUserRoleLabel(role?: string | null): string {
  if (!role) return '-';
  const labels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin / Owner',
    SALES_MANAGER: 'Sales Manager',
    TEAM_LEADER: 'Team Leader',
    FIELD_EXECUTIVE: 'Field Executive',
    TELECALLER: 'Telecaller',
    SALES_EXECUTIVE: 'Sales Executive',
    EXECUTIVE: 'Executive',
    FINANCE_OPS: 'Finance / Operations',
    SUPPORT: 'Support / Onboarding',
  };
  return (
    labels[role] ??
    role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

// ─── Data Scope ─────────────────────────────────────────────────────────────────

export const DataScopeSchema = z.enum([
  'ALL',
  'ASSIGNED_CITY',
  'ASSIGNED_TEAM',
  'SELF_AND_ASSIGNED_LEADS',
]);

export type DataScope = z.infer<typeof DataScopeSchema>;

// ─── Permissions ────────────────────────────────────────────────────────────────

export const ModulePermissionSchema = z.object({
  moduleKey: z.string(),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
});

export type ModulePermission = z.infer<typeof ModulePermissionSchema>;

// ─── Password Policy ────────────────────────────────────────────────────────────

export const PASSWORD_MIN_LENGTH = 8;

export const PasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

// ─── Login ──────────────────────────────────────────────────────────────────────

export const LoginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    employeeCode: z.string().trim().min(1).optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((v) => Boolean(v.email || v.employeeCode), {
    message: 'Email or employee code is required',
    path: ['email'],
  });

export type LoginInput = z.infer<typeof LoginSchema>;

// ─── OTP ────────────────────────────────────────────────────────────────────────

export const OtpVerifySchema = z.object({
  challengeToken: z.string().min(1, 'Challenge token is required'),
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit OTP'),
});

export type OtpVerifyInput = z.infer<typeof OtpVerifySchema>;

export const OtpResendSchema = z.object({
  challengeToken: z.string().min(1, 'Challenge token is required'),
});

export type OtpResendInput = z.infer<typeof OtpResendSchema>;

// ─── Forgot / Reset Password ────────────────────────────────────────────────────

export const ForgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or mobile number is required'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ─── Change Password ────────────────────────────────────────────────────────────

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  logoutOtherDevices: z.boolean().default(false),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// ─── Auth Tokens / Response ─────────────────────────────────────────────────────

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  fullName: z.string().nullable().optional(),
  employeeCode: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  permissions: z.array(ModulePermissionSchema).default([]),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: AuthUserSchema,
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const OtpRequiredResponseSchema = z.object({
  requiresOtp: z.literal(true),
  challengeToken: z.string(),
  deliveryTarget: z.string(),
  expiresInSeconds: z.number(),
  resendAfterSeconds: z.number(),
});

export type OtpRequiredResponse = z.infer<typeof OtpRequiredResponseSchema>;

export const LoginResponseSchema = z.union([
  AuthTokensSchema,
  OtpRequiredResponseSchema,
]);

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ─── Profile ────────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(200).optional(),
  mobile: z.string().trim().min(8).max(15).nullable().optional(),
  preferredLanguage: z.string().trim().max(10).optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  officeAddress: z.string().trim().max(500).nullable().optional(),
  designation: z.string().trim().max(150).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── Session ────────────────────────────────────────────────────────────────────

export const SessionSchema = z.object({
  id: z.string(),
  platform: z.string().nullable(),
  ip: z.string().nullable(),
  location: z.string().nullable(),
  userAgent: z.string().nullable(),
  lastSeenAt: z.string(),
  createdAt: z.string(),
  isCurrent: z.boolean(),
  status: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;
