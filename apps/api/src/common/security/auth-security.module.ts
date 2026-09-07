import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestPrincipalService } from './request-principal.service';
import { RequestPrincipalGuard } from '../guards/request-principal.guard';
import { MembershipContextGuard } from '../guards/membership-context.guard';

import { PermissionCacheService } from './permission-cache.service';
import { EffectivePermissionService } from './effective-permission.service';
import { RolePermissionService } from './role-permission.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { SubscriptionAccessGuard } from '../guards/subscription-access.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [
    SubscriptionAccessGuard,
    JwtAuthGuard,
    PermissionCacheService,
    EffectivePermissionService,
    RolePermissionService,
    RequestPrincipalService,
    RequestPrincipalGuard,
    MembershipContextGuard,
    PermissionsGuard,
  ],
  exports: [
    SubscriptionAccessGuard,
    JwtModule,
    JwtAuthGuard,
    PermissionCacheService,
    EffectivePermissionService,
    RolePermissionService,
    RequestPrincipalService,
    RequestPrincipalGuard,
    MembershipContextGuard,
    PermissionsGuard,
  ],
})
export class AuthSecurityModule {}
