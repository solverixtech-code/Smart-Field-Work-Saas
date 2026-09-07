import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestPrincipalGuard } from '../guards/request-principal.guard';
import { MembershipContextGuard } from '../guards/membership-context.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { SubscriptionAccessGuard } from '../guards/subscription-access.guard';

/**
 * Composite decorator enforcing explicit guard evaluation order for Tenant endpoints:
 * 1. JwtAuthGuard - Authenticates JWT token
 * 2. RequestPrincipalGuard - Resolves RequestPrincipal and membership context
 * 3. MembershipContextGuard - Verifies tenant membership context exists
 * 4. PermissionsGuard - Validates tenant permissions against RequestPrincipal
 */
export function TenantAuthorized() {
  return applyDecorators(
    UseGuards(
      JwtAuthGuard,
      RequestPrincipalGuard,
      MembershipContextGuard,
      PermissionsGuard,
      SubscriptionAccessGuard,
    ),
  );
}
