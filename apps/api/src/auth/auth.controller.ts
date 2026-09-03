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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } })
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: LoginInput,
    @Req() req: Request,
  ) {
    return this.authService.login(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 10 } })
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    return this.authService.getProfile(req['user'].sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
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
  @UseInterceptors(FileInterceptor('file'))
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
  @HttpCode(HttpStatus.OK)
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
  async getSessions(@Req() req: Request) {
    return this.authService.getSessions(req['user'].sub);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Param('id') id: string, @Req() req: Request) {
    return this.authService.revokeSession(req['user'].sub, id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
