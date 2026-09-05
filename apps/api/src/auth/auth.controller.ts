import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { z } from 'zod';
import {
  LoginSchema,
  LoginInput,
  OtpVerifySchema,
  OtpVerifyInput,
  OtpResendSchema,
  OtpResendInput,
  ForgotPasswordSchema,
  ForgotPasswordInput,
  ResetPasswordSchema,
  ResetPasswordInput,
  ChangePasswordSchema,
  ChangePasswordInput,
  UpdateProfileSchema,
  UpdateProfileInput,
} from '@visiblo/shared';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestPrincipalGuard } from '../common/guards/request-principal.guard';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  LoginSwaggerDto,
  OtpVerifySwaggerDto,
  OtpResendSwaggerDto,
  RefreshTokenSwaggerDto,
  ForgotPasswordSwaggerDto,
  ResetPasswordSwaggerDto,
  ChangePasswordSwaggerDto,
  UpdateProfileSwaggerDto,
  AvatarUploadSwaggerDto,
} from './dto/auth.dto';

import { MembershipSelectionService } from '../platform/tenants/membership-selection.service';

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

@ApiTags('Authentication & Profile')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly membershipSelectionService: MembershipSelectionService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } })
  @ApiOperation({
    summary: 'Authenticate User (Login / OAuth2 Token Endpoint)',
    description:
      'Log in with email address, employee code, or username and password. Supports JSON & application/x-www-form-urlencoded format for Swagger OAuth2 password flow.',
  })
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @ApiBody({ type: LoginSwaggerDto })
  @ApiResponse({ status: 200, description: 'Authentication successful or 2FA challenge issued' })
  async login(
    @Body() body: any,
    @Req() req: Request,
  ) {
    const rawIdentifier = (
      body?.username ||
      body?.emailOrCode ||
      body?.email ||
      body?.employeeCode ||
      ''
    ).toString().trim();

    const normalizedBody: any = {
      password: body?.password || '',
    };

    if (rawIdentifier) {
      if (rawIdentifier.includes('@')) {
        normalizedBody.email = rawIdentifier;
      } else {
        normalizedBody.employeeCode = rawIdentifier;
      }
    }

    const parsedBody = LoginSchema.parse(normalizedBody);

    const result = await this.authService.login(parsedBody, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (result && (result as any).accessToken) {
      return {
        access_token: (result as any).accessToken,
        token_type: 'bearer',
        ...result,
      };
    }

    return result;
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 10 } })
  @ApiOperation({
    summary: 'Verify 2FA OTP Code',
    description: 'Verify 6-digit OTP code using the challenge token issued during initial login.',
  })
  @ApiBody({ type: OtpVerifySwaggerDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully; returns access & refresh tokens' })
  async verifyOtp(
    @Body(new ZodValidationPipe(OtpVerifySchema)) body: OtpVerifyInput,
    @Req() req: Request,
  ) {
    return this.authService.verifyOtp(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } })
  @ApiOperation({
    summary: 'Resend 2FA OTP Code',
    description: 'Trigger resend of 6-digit OTP code using active challenge token.',
  })
  @ApiBody({ type: OtpResendSwaggerDto })
  @ApiResponse({ status: 200, description: 'OTP code re-sent via SMS/Email' })
  async resendOtp(
    @Body(new ZodValidationPipe(OtpResendSchema)) body: OtpResendInput,
    @Req() req: Request,
  ) {
    return this.authService.resendOtp(body.challengeToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 10 } })
  @ApiOperation({
    summary: 'Refresh JWT Access Token',
    description: 'Issue a fresh access token and rotated refresh token using valid refresh token.',
  })
  @ApiBody({ type: RefreshTokenSwaggerDto })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  async refresh(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) body: { refreshToken: string },
    @Req() req: Request,
  ) {
    return this.authService.refreshTokens(body.refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Logout',
    description: 'Invalidate current refresh token and terminate session.',
  })
  @ApiBody({ type: RefreshTokenSwaggerDto })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) body: { refreshToken: string },
    @Req() req: Request,
  ) {
    await this.authService.logout(body.refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 3 } })
  @ApiOperation({
    summary: 'Initiate Forgot Password Request',
    description: 'Send password reset link to user email address.',
  })
  @ApiBody({ type: ForgotPasswordSwaggerDto })
  @ApiResponse({ status: 200, description: 'Password reset link sent if account exists' })
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema)) body: ForgotPasswordInput,
    @Req() req: Request,
  ) {
    return this.authService.forgotPassword(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } })
  @ApiOperation({
    summary: 'Complete Reset Password',
    description: 'Set a new account password using valid reset token.',
  })
  @ApiBody({ type: ResetPasswordSwaggerDto })
  @ApiResponse({ status: 200, description: 'Password reset completed successfully' })
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema)) body: ResetPasswordInput,
    @Req() req: Request,
  ) {
    return this.authService.resetPassword(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  // ─── Authenticated Routes ──────────────────────────────────────────────────

  @Get('authorization')
  @UseGuards(JwtAuthGuard, RequestPrincipalGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Server-Issued Authorization State Bootstrap',
    description: 'Fetch live server authorization state including platform roles, tenant roles, and scope-separated permissions.',
  })
  @ApiResponse({ status: 200, description: 'Authorization bootstrap details returned' })
  async getAuthorizationBootstrap(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.authService.getAuthorizationBootstrap(principal);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Current Authenticated User Profile',
    description: 'Fetch detailed profile information, active role, permissions, and status.',
  })
  @ApiResponse({ status: 200, description: 'User profile details returned' })
  async getProfile(@Req() req: Request) {
    return this.authService.getProfile(req['user'].sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update Profile Details',
    description: 'Update current user full name or mobile contact number.',
  })
  @ApiBody({ type: UpdateProfileSwaggerDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Req() req: Request,
    @Body(new ZodValidationPipe(UpdateProfileSchema)) body: UpdateProfileInput,
  ) {
    return this.authService.updateProfile(req['user'].sub, body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload User Avatar Image',
    description: 'Upload avatar image file for profile display.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AvatarUploadSwaggerDto })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully; returns image URL' })
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar image file is required');
    }
    return this.authService.uploadAvatar(req['user'].sub, file, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change Current Account Password',
    description: 'Update password by providing current active password and new password.',
  })
  @ApiBody({ type: ChangePasswordSwaggerDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Req() req: Request,
    @Body(new ZodValidationPipe(ChangePasswordSchema)) body: ChangePasswordInput,
  ) {
    return this.authService.changePassword(
      req['user'].sub,
      body,
      null,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Active User Sessions',
    description: 'Fetch list of active device logins and sessions for authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Active sessions array returned' })
  async getSessions(@Req() req: Request) {
    return this.authService.getSessions(req['user'].sub);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Revoke Active User Session',
    description: 'Terminate an active session by session ID.',
  })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(@Param('id') id: string, @Req() req: Request) {
    return this.authService.revokeSession(req['user'].sub, id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('memberships')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get User Tenant Memberships & Selection State',
    description: 'Retrieves all active tenant memberships and selection metadata for the logged-in user.',
  })
  @ApiResponse({ status: 200, description: 'Membership selection state returned.' })
  async getMemberships(@Req() req: Request) {
    return this.membershipSelectionService.evaluateMembershipSelection(req['user'].sub);
  }

  @Post('memberships/select')
  @UseGuards(JwtAuthGuard, RequestPrincipalGuard)
  @ApiBearerAuth('OAuth2PasswordBearer')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Select Active Tenant Membership Workspace',
    description: 'Switch active workspace session to a specific active membership ID.',
  })
  @ApiResponse({ status: 200, description: 'Membership selected successfully; returns rotated session tokens.' })
  async selectMembership(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: { membershipId: string },
    @Req() req: Request,
  ) {
    if (!body?.membershipId) {
      throw new BadRequestException('membershipId is required');
    }
    return this.authService.selectMembership(
      principal.userId,
      principal.sessionId,
      body.membershipId,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
  }
}
