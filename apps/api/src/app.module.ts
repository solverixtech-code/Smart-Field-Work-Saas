import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { validationSchemaForEnv } from './config/environment-variables';
import { PersistenceModule } from './persistence/persistence.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ShiftModule } from './shift/shift.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { PlatformModulesModule } from './platform/modules/platform-modules.module';
import { PlatformTenantsModule } from './platform/tenants/platform-tenants.module';
import { ApiThrottlerGuard } from './common/guards/api-throttler.guard';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { RedisThrottlerStorage } from './common/throttling/redis-throttler.storage';
import { ThrottlingModule } from './common/throttling/throttling.module';

import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ThrottlingModule],
      inject: [ConfigService, RedisThrottlerStorage],
      useFactory: (
        configService: ConfigService,
        redisThrottlerStorage: RedisThrottlerStorage,
      ) => ({
        storage: redisThrottlerStorage,
        throttlers: [
          {
            name: 'default',
            ttl: configService.getOrThrow<number>('RATE_LIMIT_TTL_MS'),
            limit: configService.getOrThrow<number>('RATE_LIMIT_LIMIT'),
          },
        ],
      }),
    }),
    RedisModule,
    ThrottlingModule,
    PersistenceModule,
    AuthModule,
    ShiftModule,
    AttendanceModule,
    PayrollModule,
    PlatformModulesModule,
    PlatformTenantsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
  ],
})
export class AppModule {}
