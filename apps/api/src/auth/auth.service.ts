import { auditEvents } from "../audit/audit-event-writer";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomInt, randomUUID } from 'crypto';

import {
  LoginSchema,
  OtpVerifySchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  PasswordSchema,
  type LoginInput,
  type AuthTokens,
  type OtpRequiredResponse,
  type LoginResponse,
} from '@visiblo/shared';

import { PrismaService } from '../persistence/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { StorageService } from '../common/services/storage.service';
import { MembershipSelectionService } from '../platform/tenants/membership-selection.service';

const OTP_TTL_SECONDS = 5 * 60;
const OTP_RESEND_SECONDS = 30;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL_MINUTES = 30;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly storageService: StorageService,
    private readonly membershipSelectionService: MembershipSelectionService,
  ) {}

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(
    dto: LoginInput,
    meta: { ip?: string; userAgent?: string },
  ): Promise<LoginResponse> {
    const credentials = LoginSchema.parse(dto);
    const email = credentials.email?.trim().toLowerCase();
    const employeeCode = credentials.employeeCode?.trim();
    const password = credentials.password;

    const user = email
      ? await this.prisma.user.findUnique({ where: { email } })
      : employeeCode
        ? await this.prisma.user.findUnique({ where: { employeeCode } })
        : null;

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      await this.audit({
        action: 'LOGIN_FAILURE',
        entityType: 'USER',
        metadata: { email, employeeCode, reason: 'INVALID_CREDENTIALS' },
        ...meta,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      await this.audit({
        action: 'LOGIN_FAILURE',
        actorUserId: user.id,
        entityType: 'USER',
        entityId: user.id,
        metadata: { reason: 'ACCOUNT_DISABLED' },
        ...meta,
      });
      throw new UnauthorizedException('Account is disabled');
    }

    // Check if 2FA is required
    if (await this.isTwoFactorRequired(user)) {
      return this.createOtpChallenge(user, meta);
    }

    // No 2FA — issue full session
    return this.createSessionAndTokens(user, meta);
  }

  // ─── OTP Verify ─────────────────────────────────────────────────────────────

  async verifyOtp(
    dto: { challengeToken: string; otp: string },
    meta: { ip?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const input = OtpVerifySchema.parse(dto);
    const allowBypass = this.configService.get<string>('ALLOW_DEV_OTP_BYPASS') === 'true';
    const isDevBypass =
      process.env.NODE_ENV !== 'production' &&
      allowBypass &&
      input.otp === '000000';

    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { challengeToken: input.challengeToken },
      include: { user: true },
    });

    if (!challenge) {
      await this.audit({
        action: 'OTP_FAILURE',
        entityType: 'USER',
        metadata: { reason: 'EXPIRED_OR_MISSING' },
        ...meta,
      });
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    if (!isDevBypass && (challenge.consumedAt || challenge.expiresAt <= new Date())) {
      await this.audit({
        action: 'OTP_FAILURE',
        entityType: 'USER',
        metadata: { reason: 'EXPIRED_OR_MISSING' },
        ...meta,
      });
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    if (!isDevBypass && challenge.attemptCount >= OTP_MAX_ATTEMPTS) {
      await this.audit({
        action: 'OTP_FAILURE',
        actorUserId: challenge.userId,
        entityType: 'USER',
        entityId: challenge.userId,
        metadata: { reason: 'MAX_ATTEMPTS_EXCEEDED' },
        ...meta,
      });
      throw new UnauthorizedException('Too many invalid attempts. Please request a new code.');
    }

    const isValid =
      isDevBypass || (await argon2.verify(challenge.codeHash, input.otp));
    if (!isValid) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attemptCount: { increment: 1 } },
      });
      await this.audit({
        action: 'OTP_FAILURE',
        actorUserId: challenge.userId,
        entityType: 'USER',
        entityId: challenge.userId,
        metadata: { reason: 'INVALID_OTP' },
        ...meta,
      });
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    await this.audit({
      action: 'LOGIN_SUCCESS',
      actorUserId: challenge.userId,
      entityType: 'USER',
      entityId: challenge.userId,
      metadata: { stage: 'OTP_ACCEPTED' },
      ...meta,
    });

    return this.createSessionAndTokens(challenge.user, meta);
  }

  // ─── OTP Resend ─────────────────────────────────────────────────────────────

  async resendOtp(
    challengeToken: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<{
    success: boolean;
    challengeToken: string;
    expiresInSeconds: number;
    resendAfterSeconds: number;
  }> {
    const existing = await this.prisma.otpChallenge.findUnique({
      where: { challengeToken },
      include: { user: true },
    });

    if (!existing || existing.consumedAt || existing.expiresAt <= new Date()) {
      throw new UnauthorizedException('Verification session invalid or expired. Please sign in again.');
    }

    // Check resend cooldown
    const secondsSinceCreation =
      (Date.now() - existing.createdAt.getTime()) / 1000;
    if (secondsSinceCreation < OTP_RESEND_SECONDS) {
      return {
        success: true,
        challengeToken: existing.challengeToken,
        expiresInSeconds: Math.max(0, Math.floor((existing.expiresAt.getTime() - Date.now()) / 1000)),
        resendAfterSeconds: Math.max(0, Math.ceil(OTP_RESEND_SECONDS - secondsSinceCreation)),
      };
    }

    // Invalidate old, create new
    await this.prisma.otpChallenge.update({
      where: { id: existing.id },
      data: { consumedAt: new Date() },
    });

    const otp = this.generateOtp();
    const codeHash = await argon2.hash(otp);
    const newToken = randomUUID();

    await this.prisma.otpChallenge.create({
      data: {
        userId: existing.userId,
        challengeToken: newToken,
        codeHash,
        channel: existing.channel,
        expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
        requestIp: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    });

    // Send via same channel
    if (existing.channel === 'EMAIL') {
      await this.emailService.sendOtp({ to: existing.user.email, otp });
    } else if (existing.channel === 'SMS' && existing.user.mobile) {
      await this.smsService.sendOtp({ mobile: existing.user.mobile, otp });
    }

    return {
      success: true,
      challengeToken: newToken,
      expiresInSeconds: OTP_TTL_SECONDS,
      resendAfterSeconds: OTP_RESEND_SECONDS,
    };
  }

  // ─── Refresh ────────────────────────────────────────────────────────────────

  async refreshTokens(
    refreshToken: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let matchedSession: any = null;

    if (payload.sid) {
      const session = await this.prisma.userSession.findUnique({
        where: { id: payload.sid },
        include: { user: true },
      });
      if (session && session.status === 'ACTIVE' && session.userId === payload.sub) {
        try {
          if (await argon2.verify(session.refreshTokenHash, refreshToken)) {
            matchedSession = session;
          }
        } catch {}
      }
    }

    if (!matchedSession) {
      const sessions = await this.prisma.userSession.findMany({
        where: {
          userId: payload.sub,
          status: 'ACTIVE',
        },
        include: { user: true },
      });

      for (const session of sessions) {
        try {
          const isValid = await argon2.verify(
            session.refreshTokenHash,
            refreshToken,
          );
          if (isValid) {
            matchedSession = session;
            break;
          }
        } catch {}
      }
    }

    if (
      !matchedSession ||
      !matchedSession.user ||
      matchedSession.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let selectedMembershipId = matchedSession.selectedMembershipId;
    let contextVersion = matchedSession.contextVersion;

    if (selectedMembershipId) {
      const mem = await this.prisma.tenantMembership.findUnique({
        where: { id: selectedMembershipId },
        include: { tenant: true },
      });
      if (!mem || mem.status !== 'ACTIVE' || !mem.tenant || mem.tenant.status !== 'ACTIVE') {
        const selectionEval = await this.membershipSelectionService.evaluateMembershipSelection(matchedSession.userId);
        selectedMembershipId = selectionEval.autoSelectableMembershipId;
        contextVersion += 1;
        await this.prisma.userSession.update({
          where: { id: matchedSession.id },
          data: {
            selectedMembershipId,
            contextVersion,
            selectedMembershipAt: selectedMembershipId ? new Date() : null,
          },
        });
      }
    }

    // Rotate refresh token
    const tokens = await this.generateTokens(matchedSession.user, {
      sessionId: matchedSession.id,
      selectedMembershipId,
      contextVersion,
    });
    const newRefreshTokenHash = await argon2.hash(tokens.refreshToken);

    await this.prisma.userSession.update({
      where: { id: matchedSession.id },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        lastSeenAt: new Date(),
        ip: meta.ip ?? matchedSession.ip,
        userAgent: meta.userAgent ?? matchedSession.userAgent,
      },
    });

    return tokens;
  }

  // ─── Membership Selection ───────────────────────────────────────────────

  async selectMembership(
    userId: string,
    sessionId: string | null,
    membershipId: string,
    meta: { ip?: string; userAgent?: string },
  ) {
    if (!sessionId) {
      throw new UnauthorizedException('Valid session binding (sid) is required for membership selection.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account inactive');
    }

    const membership = await this.prisma.tenantMembership.findUnique({
      where: { id: membershipId },
      include: { tenant: true, tenantRole: true },
    });

    if (
      !membership ||
      membership.userId !== userId ||
      membership.status !== 'ACTIVE' ||
      !membership.tenant ||
      membership.tenant.status !== 'ACTIVE'
    ) {
      throw new BadRequestException('Selected membership is invalid, suspended, or inactive.');
    }

    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId, status: 'ACTIVE' },
    });

    if (!session) {
      throw new UnauthorizedException('Active session not found or revoked');
    }

    const newContextVersion = session.contextVersion + 1;
    const selectedMembershipAt = new Date();

    const tokens = await this.generateTokens(user, {
      sessionId: session.id,
      selectedMembershipId: membership.id,
      contextVersion: newContextVersion,
    });

    const refreshTokenHash = await argon2.hash(tokens.refreshToken);

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        selectedMembershipId: membership.id,
        contextVersion: newContextVersion,
        selectedMembershipAt,
        refreshTokenHash,
        lastSeenAt: new Date(),
      },
    });

    await this.audit({
      action: 'MEMBERSHIP_SELECTED',
      actorUserId: userId,
      entityType: 'TENANT_MEMBERSHIP',
      entityId: membership.id,
      metadata: { tenantId: membership.tenantId, contextVersion: newContextVersion },
      ...meta,
    });

    return {
      selectedMembershipId: membership.id,
      selectionRequired: false,
      membership: {
        id: membership.id,
        tenantId: membership.tenantId,
        tenantDisplayName: membership.tenant.displayName,
        tenantSlug: membership.tenant.slug,
        tenantRoleCode: membership.tenantRole?.code ?? null,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────

  async logout(
    refreshToken: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<void> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      return;
    }

    const sessions = await this.prisma.userSession.findMany({
      where: { userId: payload.sub, status: 'ACTIVE' },
    });

    for (const session of sessions) {
      try {
        if (await argon2.verify(session.refreshTokenHash, refreshToken)) {
          await this.prisma.userSession.update({
            where: { id: session.id },
            data: { status: 'REVOKED' },
          });
          await this.audit({
            action: 'LOGOUT',
            actorUserId: payload.sub,
            entityType: 'SESSION',
            entityId: session.id,
            ...meta,
          });
          break;
        }
      } catch {
        continue;
      }
    }
  }

  async getAuthorizationBootstrap(principal: RequestPrincipal) {
    const user = await this.prisma.user.findUnique({
      where: { id: principal.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      schemaVersion: 1,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      session: {
        id: principal.sessionId,
      },
      platform: {
        roleCodes: principal.platformRoleCodes,
        permissions: principal.platformPermissions,
        permissionVersion: principal.permissionVersion.platform,
      },
      tenant: principal.tenantId
        ? {
            id: principal.tenantId,
            membershipId: principal.membershipId,
            roleCode: principal.tenantRoleCode,
            dataScope: principal.dataScope,
            permissions: principal.tenantPermissions,
            permissionVersion: principal.permissionVersion.tenant,
          }
        : null,
    };
  }

  // ─── Forgot Password ───────────────────────────────────────────────────────

  async forgotPassword(
    dto: { identifier: string },
    meta: { ip?: string; userAgent?: string },
  ): Promise<{ success: boolean; message: string }> {
    const input = ForgotPasswordSchema.parse(dto);
    const genericResponse = {
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    };

    const identifier = input.identifier.trim().toLowerCase();
    const user = identifier.includes('@')
      ? await this.prisma.user.findUnique({ where: { email: identifier } })
      : await this.prisma.user.findFirst({
          where: { mobile: identifier.replace(/\D/g, '') },
        });

    if (!user || user.status !== 'ACTIVE') {
      await this.audit({
        action: 'FORGOT_PASSWORD_IGNORED',
        entityType: 'USER',
        metadata: { reason: !user ? 'USER_NOT_FOUND' : 'ACCOUNT_DISABLED' },
        ...meta,
      });
      return genericResponse;
    }

    const resetToken = randomUUID();
    const resetTokenHash = await argon2.hash(resetToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: resetTokenHash,
        passwordResetExpiresAt: new Date(
          Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
        ),
      },
    });

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/admin/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetLink({
      to: user.email,
      resetUrl,
    });

    await this.audit({
      action: 'FORGOT_PASSWORD_REQUESTED',
      actorUserId: user.id,
      entityType: 'USER',
      entityId: user.id,
      ...meta,
    });

    return genericResponse;
  }

  // ─── Reset Password ────────────────────────────────────────────────────────

  async resetPassword(
    dto: { token: string; newPassword: string; confirmPassword: string },
    meta: { ip?: string; userAgent?: string },
  ): Promise<{ success: boolean }> {
    const input = ResetPasswordSchema.parse(dto);

    const users = await this.prisma.user.findMany({
      where: {
        passwordResetTokenHash: { not: null },
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    let matchedUser: User | null = null;
    for (const user of users) {
      if (
        user.passwordResetTokenHash &&
        (await argon2.verify(user.passwordResetTokenHash, input.token))
      ) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const passwordHash = await argon2.hash(input.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: matchedUser.id },
        data: {
          passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          lastPasswordChangeAt: new Date(),
        },
      }),
      this.prisma.userSession.updateMany({
        where: { userId: matchedUser.id, status: 'ACTIVE' },
        data: { status: 'REVOKED' },
      }),
    ]);

    await this.audit({
      action: 'PASSWORD_RESET',
      actorUserId: matchedUser.id,
      entityType: 'USER',
      entityId: matchedUser.id,
      ...meta,
    });

    return { success: true };
  }

  // ─── Change Password ───────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    dto: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      logoutOtherDevices?: boolean;
    },
    currentSessionId: string | null,
    meta: { ip?: string; userAgent?: string },
  ): Promise<{ success: boolean }> {
    const input = ChangePasswordSchema.parse(dto);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (!(await argon2.verify(user.passwordHash, input.currentPassword))) {
      await this.audit({
        action: 'CHANGE_PASSWORD_FAILURE',
        actorUserId: userId,
        entityType: 'USER',
        entityId: userId,
        metadata: { reason: 'INVALID_CURRENT_PASSWORD' },
        ...meta,
      });
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(input.newPassword);

    const operations: any[] = [
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash, lastPasswordChangeAt: new Date() },
      }),
    ];

    if (input.logoutOtherDevices && currentSessionId) {
      operations.push(
        this.prisma.userSession.updateMany({
          where: {
            userId,
            status: 'ACTIVE',
            id: { not: currentSessionId },
          },
          data: { status: 'REVOKED' },
        }),
      );
    }

    await this.prisma.$transaction(operations);

    await this.audit({
      action: 'PASSWORD_CHANGED',
      actorUserId: userId,
      entityType: 'USER',
      entityId: userId,
      metadata: { logoutOtherDevices: input.logoutOtherDevices },
      ...meta,
    });

    return { success: true };
  }

  // ─── Profile ────────────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });
    if (!user) throw new UnauthorizedException();

    return {
      id: user.id,
      employeeCode: user.employeeCode,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      dataScope: user.dataScope,
      teamName: user.team?.name ?? null,
      defaultTerritoryId: user.defaultTerritoryId,
      avatarUrl: user.avatarUrl,
      preferredLanguage: user.preferredLanguage,
      status: user.status,
      joinedAt: user.joinedAt,
      lastLoginAt: user.lastLoginAt,
      lastPasswordChangeAt: user.lastPasswordChangeAt,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }

  async updateProfile(
    userId: string,
    dto: { fullName?: string; mobile?: string; preferredLanguage?: string },
    meta: { ip?: string; userAgent?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const beforeJson = {
      fullName: user.fullName,
      mobile: user.mobile,
      preferredLanguage: user.preferredLanguage,
    };

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.mobile !== undefined && { mobile: dto.mobile }),
        ...(dto.preferredLanguage !== undefined && {
          preferredLanguage: dto.preferredLanguage,
        }),
      },
    });

    await this.audit({
      action: 'PROFILE_UPDATED',
      actorUserId: userId,
      entityType: 'USER',
      entityId: userId,
      beforeJson,
      afterJson: {
        fullName: updated.fullName,
        mobile: updated.mobile,
        preferredLanguage: updated.preferredLanguage,
      },
      ...meta,
    });

    return this.getProfile(userId);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
    meta: { ip?: string; userAgent?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const avatarUrl = await this.storageService.uploadFile(file, 'avatars');

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    await this.audit({
      action: 'AVATAR_UPLOADED',
      actorUserId: userId,
      entityType: 'USER',
      entityId: userId,
      metadata: { avatarUrl },
      ...meta,
    });

    return {
      avatarUrl,
      user: await this.getProfile(userId),
    };
  }

  // ─── Sessions ───────────────────────────────────────────────────────────────

  async getSessions(userId: string, currentRefreshToken?: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });

    const result: Array<{
      id: string;
      platform: string | null;
      ip: string | null;
      location: string | null;
      userAgent: string | null;
      lastSeenAt: string;
      createdAt: string;
      isCurrent: boolean;
      status: string;
    }> = [];
    for (const session of sessions) {
      let isCurrent = false;
      if (currentRefreshToken) {
        try {
          isCurrent = await argon2.verify(
            session.refreshTokenHash,
            currentRefreshToken,
          );
        } catch {
          isCurrent = false;
        }
      }

      result.push({
        id: session.id,
        platform: session.platform,
        ip: session.ip,
        location: session.location,
        userAgent: session.userAgent,
        lastSeenAt: session.lastSeenAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
        isCurrent,
        status: session.status,
      });
    }

    return { data: result };
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<{ success: boolean }> {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) throw new BadRequestException('Session not found');

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { status: 'REVOKED' },
    });

    await this.audit({
      action: 'SESSION_REVOKED',
      actorUserId: userId,
      entityType: 'SESSION',
      entityId: sessionId,
      ...meta,
    });

    return { success: true };
  }

  async revokeAllOtherSessions(
    userId: string,
    currentRefreshToken: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<{ success: boolean }> {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    for (const session of sessions) {
      let isCurrent = false;
      try {
        isCurrent = await argon2.verify(
          session.refreshTokenHash,
          currentRefreshToken,
        );
      } catch {
        isCurrent = false;
      }

      if (!isCurrent) {
        await this.prisma.userSession.update({
          where: { id: session.id },
          data: { status: 'REVOKED' },
        });
      }
    }

    await this.audit({
      action: 'ALL_OTHER_SESSIONS_REVOKED',
      actorUserId: userId,
      entityType: 'USER',
      entityId: userId,
      ...meta,
    });

    return { success: true };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async createSessionAndTokens(
    user: User,
    meta: { ip?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const selectionEval = await this.membershipSelectionService.evaluateMembershipSelection(user.id);
    const selectedMembershipId = selectionEval.autoSelectableMembershipId;
    const sessionId = randomUUID();
    const contextVersion = 1;

    const tokens = await this.generateTokens(user, {
      sessionId,
      selectedMembershipId,
      contextVersion,
    });
    const refreshTokenHash = await argon2.hash(tokens.refreshToken);

    // Parse user-agent for platform detection
    const platform = this.detectPlatform(meta.userAgent);

    await this.prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        selectedMembershipId,
        contextVersion,
        selectedMembershipAt: selectedMembershipId ? new Date() : null,
        refreshTokenHash,
        platform,
        ip: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
        status: 'ACTIVE',
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.audit({
      action: 'LOGIN_SUCCESS',
      actorUserId: user.id,
      entityType: 'USER',
      entityId: user.id,
      metadata: { stage: 'SESSION_CREATED', selectedMembershipId, contextVersion },
      ...meta,
    });

    return tokens;
  }

  private async generateTokens(
    user: User,
    sessionContext?: {
      sessionId: string;
      selectedMembershipId: string | null;
      contextVersion: number;
    },
  ): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      sid: sessionContext?.sessionId,
      mid: sessionContext?.selectedMembershipId ?? null,
      ctxv: sessionContext?.contextVersion ?? 1,
      email: user.email,
      role: user.role,
    };
    const refreshPayload = {
      sub: user.id,
      sid: sessionContext?.sessionId,
      mid: sessionContext?.selectedMembershipId ?? null,
      ctxv: sessionContext?.contextVersion ?? 1,
      tokenUse: 'refresh',
      jti: randomUUID(),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: '24h',
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as any,
        fullName: user.fullName,
        employeeCode: user.employeeCode,
        image: user.avatarUrl,
        permissions: [],
      },
    };
  }

  private async isTwoFactorRequired(user: User): Promise<boolean> {
    if (user.twoFactorEnabled) return true;

    const roleSetting = await this.prisma.roleTwoFactorSetting.findUnique({
      where: { role: user.role },
      select: { enabled: true },
    });

    return roleSetting?.enabled === true;
  }

  private async createOtpChallenge(
    user: User,
    meta: { ip?: string; userAgent?: string },
  ): Promise<OtpRequiredResponse> {
    const otp = this.generateOtp();
    const codeHash = await argon2.hash(otp);
    const challengeToken = randomUUID();

    await this.prisma.otpChallenge.create({
      data: {
        userId: user.id,
        challengeToken,
        codeHash,
        channel: 'EMAIL',
        expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
        requestIp: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    });

    await this.emailService.sendOtp({ to: user.email, otp });

    await this.audit({
      action: 'OTP_REQUESTED',
      actorUserId: user.id,
      entityType: 'USER',
      entityId: user.id,
      metadata: { channel: 'EMAIL' },
      ...meta,
    });

    return {
      requiresOtp: true,
      challengeToken,
      deliveryTarget: this.maskEmail(user.email),
      expiresInSeconds: OTP_TTL_SECONDS,
      resendAfterSeconds: OTP_RESEND_SECONDS,
    };
  }

  private generateOtp(): string {
    return String(randomInt(0, 1000000)).padStart(6, '0');
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    const visible = Math.min(3, local.length);
    return `${local.slice(0, visible)}***@${domain}`;
  }

  private detectPlatform(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    return 'Unknown';
  }

  private async audit(input: {
    action: string;
    actorUserId?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: unknown;
    beforeJson?: unknown;
    afterJson?: unknown;
    ip?: string | null;
    userAgent?: string | null;
    sessionId?: string | null;
  }): Promise<void> {
    try {
      await auditEvents.write(this.prisma, {
          scope: 'SYSTEM',
          actorUserId: input.actorUserId ?? null,
          action: input.action,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          beforeJson: input.beforeJson ?? input.metadata ?? null,
          afterJson: input.afterJson ?? null,
      });
    } catch (error) {
      this.logger.warn('Authentication audit write failed');
    }
  }
}
