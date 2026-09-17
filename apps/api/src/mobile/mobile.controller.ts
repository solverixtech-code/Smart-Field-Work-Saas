import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequestPrincipalGuard } from '../common/guards/request-principal.guard';
import { RuntimeConfigService } from '../runtime/runtime-config.service';
import { DeviceTokenService } from '../notifications/device-token.service';
import { RegisterDeviceTokenDto, UnregisterDeviceTokenDto } from '../notifications/dto/register-device.dto';
import { PrismaService } from '../persistence/prisma.service';

@ApiTags('Mobile API Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RequestPrincipalGuard)
@Controller('mobile')
export class MobileController {
  constructor(
    private readonly runtimeService: RuntimeConfigService,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('bootstrap')
  @ApiOperation({
    summary: 'Bootstrap mobile application runtime context',
    description: 'Resolves authenticated user profile, active tenant workspace, permissions, branding, and features for mobile clients.',
  })
  async bootstrap(@CurrentPrincipal() principal: RequestPrincipal) {
    const user = await this.prisma.user.findUnique({
      where: { id: principal.userId },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        mobile: true,
        avatarUrl: true,
        role: true,
        status: true,
        preferredLanguage: true,
      },
    });

    let tenantInfo: Record<string, any> | null = null;
    let branding: Record<string, any> | null = null;

    if (principal.tenantId) {
      tenantInfo = await this.prisma.tenant.findUnique({
        where: { id: principal.tenantId },
        select: {
          id: true,
          slug: true,
          displayName: true,
          legalName: true,
          status: true,
          websiteUrl: true,
        },
      });

      branding = await this.prisma.tenantBranding.findUnique({
        where: { tenantId: principal.tenantId },
        select: {
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
          shortName: true,
        },
      });
    }

    let runtimeConfig: Record<string, any> | null = null;
    if (principal.tenantId && principal.membershipId) {
      try {
        runtimeConfig = await this.runtimeService.bootstrap(principal);
      } catch {
        // Fallback gracefully if runtime config revalidation is restricted
        runtimeConfig = null;
      }
    }

    return {
      success: true,
      user,
      tenant: tenantInfo,
      branding,
      principal: {
        userId: principal.userId,
        tenantId: principal.tenantId,
        membershipId: principal.membershipId,
        tenantRoleCode: principal.tenantRoleCode,
        permissions: principal.permissions,
        dataScope: principal.dataScope,
      },
      runtime: runtimeConfig,
    };
  }

  @Post('devices')
  @HttpCode(200)
  @ApiOperation({ summary: 'Register FCM push device token for mobile client' })
  async registerDevice(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    let tenantId = principal.tenantId;
    let membershipId = principal.membershipId;

    if (!tenantId || !membershipId) {
      const activeMembership = await this.prisma.tenantMembership.findFirst({
        where: {
          userId: principal.userId,
          status: 'ACTIVE',
          tenant: { status: 'ACTIVE' },
        },
        orderBy: { createdAt: 'asc' },
      });
      if (activeMembership) {
        tenantId = activeMembership.tenantId;
        membershipId = activeMembership.id;
      }
    }

    if (!tenantId || !membershipId) {
      return {
        success: false,
        message: 'No active tenant workspace found for user',
      };
    }

    const result = await this.deviceTokenService.registerToken(
      principal.userId,
      membershipId,
      tenantId,
      dto,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post('devices/unregister')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unregister FCM push device token on logout' })
  async unregisterDevice(@Body() dto: UnregisterDeviceTokenDto) {
    await this.deviceTokenService.unregisterToken(dto.token);
    return {
      success: true,
      message: 'Push device token unregistered successfully',
    };
  }
}
