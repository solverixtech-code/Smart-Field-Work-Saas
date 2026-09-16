import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { createCorsOptions } from './common/security/cors-options';
import { SafeNestLogger } from './observability/safe-nest-logger';

async function bootstrap() {
  const logger = new Logger('EntryPoint');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: new SafeNestLogger() });
  const configService = app.get(ConfigService);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter(), new ZodExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(createCorsOptions(configService.get<string>('FRONTEND_URL')));

  const config = new DocumentBuilder()
    .setTitle('Visiblo Smart Field Work SaaS API')
    .setDescription(
      'Production REST API for Visiblo Smart Field Work platform. Authorized users can authenticate via OAuth2 Password flow (username & password) or JWT Bearer token.',
    )
    .setVersion('1.0')
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          password: {
            tokenUrl: '/auth/login',
            scopes: {},
          },
        },
      },
      'OAuth2PasswordBearer',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT Bearer token obtained from POST /auth/login or /auth/verify-otp.',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const PORT = configService.get<number>('PORT') ?? 5002;
  await app.listen(PORT);
  logger.log(`Server running on http://localhost:${PORT}`);
}

bootstrap();
