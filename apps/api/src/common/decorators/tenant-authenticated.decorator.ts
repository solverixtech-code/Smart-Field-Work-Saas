import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestPrincipalGuard } from '../guards/request-principal.guard';
import { MembershipContextGuard } from '../guards/membership-context.guard';

export function TenantAuthenticated() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RequestPrincipalGuard, MembershipContextGuard),
  );
}
