import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('NestJS Application Bootstrap Smoke Test', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // Override Redis storage and thottler for testing if needed
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should compile NestJS AppModule and resolve all dependencies without DI errors', () => {
    expect(moduleRef).toBeDefined();
  });
});
