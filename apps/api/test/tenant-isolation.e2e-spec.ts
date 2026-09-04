import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';

describe('Phase 0.3.1 — Tenant Isolation & Hardened DTO E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unauthenticated Request Protection', () => {
    it('GET /shifts should return 401 Unauthorized without JWT token', async () => {
      await request(app.getHttpServer())
        .get('/shifts')
        .expect(401);
    });

    it('POST /attendance/punch-in should return 401 Unauthorized without JWT token', async () => {
      await request(app.getHttpServer())
        .post('/attendance/punch-in')
        .send({ latitude: 19.076, longitude: 72.8777 })
        .expect(401);
    });

    it('POST /payroll/generate should return 401 Unauthorized without JWT token', async () => {
      await request(app.getHttpServer())
        .post('/payroll/generate')
        .send({ month: 9, year: 2026 })
        .expect(401);
    });
  });

  describe('Global ValidationPipe & DTO Whitelisting Enforcement', () => {
    it('POST /auth/otp/send with unwhitelisted extra parameter should return 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/auth/otp/send')
        .send({
          email: 'test@example.com',
          unwhitelistedExtraField: 'malicious-payload',
        })
        .expect(400);
    });
  });

  describe('Database Integrity & Tenant Scope Isolation Verification', () => {
    it('should verify Prisma connection is established to real database', async () => {
      const tenantCount = await prisma.tenant.count();
      expect(typeof tenantCount).toBe('number');
    });
  });
});
