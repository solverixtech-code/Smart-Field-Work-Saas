import { Test } from '@nestjs/testing';
import { AppModule } from './src/app.module';
import { CrmService } from './src/crm/crm.service';

async function testService() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const crmService = moduleRef.get(CrmService);

  const principal = {
    userId: 'c3178ac7-4cdc-4f7c-b3f0-d3c14e07408b',
    tenantId: '13e8650b-cf97-453d-8676-60d770d403dc',
    membershipId: '865df8e9-ca84-4df6-9a5b-cccb8b636d18',
    roles: ['tenant_admin'],
    tenantPermissions: [],
    platformPermissions: [],
    permissionVersion: 1,
    contextVersion: 1,
  };

  console.log("Calling crmService.listAccounts...");
  try {
    const res = await crmService.listAccounts(principal as any, { page: 1, limit: 25 });
    console.log("SUCCESS:", res);
  } catch (err: any) {
    console.error("=== SERVICE ERROR ===");
    console.error(err);
  }

  await app.close();
}

testService().catch(console.error);
