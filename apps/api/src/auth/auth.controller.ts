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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } })
  async login(@Body() body: any, @Req() req: Request) {
    return this.authService.login(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 10 } })
  async verifyOtp(@Body() body: any, @Req() req: Request) {
    return this.authService.verifyOtp(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } })
  async resendOtp(@Body() body: any, @Req() req: Request) {
    return this.authService.resendOtp(body.challengeToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 10 } })
  async refresh(@Body() body: any, @Req() req: Request) {
    return this.authService.refreshTokens(body.refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: any, @Req() req: Request) {
    await this.authService.logout(body.refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 3 } })
  async forgotPassword(@Body() body: any, @Req() req: Request) {
    return this.authService.forgotPassword(body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } })
  async resetPassword(@Body() body: any, @Req() req: Request) {
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
  async updateProfile(@Req() req: Request, @Body() body: any) {
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
    return this.authService.uploadAvatar(req['user'].sub, file, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: Request, @Body() body: any) {
    return this.authService.changePassword(
      req['user'].sub,
      body,
      null, // TODO: derive session ID from refresh token
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
