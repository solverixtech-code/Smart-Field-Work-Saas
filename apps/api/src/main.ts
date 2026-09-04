import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';

async function bootstrap() {
  const logger = new Logger('EntryPoint');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(cookieParser());
  app.useGlobalFilters(new ZodExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const allowedList = [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
      ].filter(Boolean);

      if (
        allowedList.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):?\d*$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  });

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
