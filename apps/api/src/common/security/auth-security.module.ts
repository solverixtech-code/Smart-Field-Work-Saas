import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequestPrincipalService } from './request-principal.service';
import { RequestPrincipalGuard } from '../guards/request-principal.guard';
import { MembershipContextGuard } from '../guards/membership-context.guard';

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
    JwtAuthGuard,
    RequestPrincipalService,
    RequestPrincipalGuard,
    MembershipContextGuard,
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    RequestPrincipalService,
    RequestPrincipalGuard,
    MembershipContextGuard,
  ],
})
export class AuthSecurityModule {}
