async function testApi() {
  // 1. Login as tenant admin
  const loginRes = await fetch('http://127.0.0.1:5002/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sahibjitsinghramgharia@gmail.com',
      password: 'Admin@123456',
    }),
  });

  const loginData = await loginRes.json() as any;
  console.log("Login Status:", loginRes.status);
  if (!loginRes.ok) {
    console.error("Login failed:", loginData);
    return;
  }

  const token = loginData.accessToken;
  const membershipId = loginData.user?.tenantMemberships?.[0]?.id || '865df8e9-ca84-4df6-9a5b-cccb8b636d18';

  // Select membership first
  const selectRes = await fetch('http://127.0.0.1:5002/auth/select-tenant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ membershipId }),
  });
  console.log("Select Tenant Status:", selectRes.status);
  const selectData = await selectRes.json() as any;
  const sessionToken = selectData.accessToken || token;

  // Test GET accounts
  console.log("\n--- Testing GET /tenant/crm/accounts ---");
  const accRes = await fetch('http://127.0.0.1:5002/tenant/crm/accounts?page=1&limit=25', {
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
    },
  });
  console.log("Accounts Status:", accRes.status);
  const accText = await accRes.text();
  console.log("Accounts Response:", accText);

  // Test GET tenant master values
  console.log("\n--- Testing GET /tenant/masters/business_type/values ---");
  const masterRes = await fetch('http://127.0.0.1:5002/tenant/masters/business_type/values?search=&page=1&limit=50', {
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
    },
  });
  console.log("Master Values Status:", masterRes.status);
  const masterText = await masterRes.text();
  console.log("Master Values Response:", masterText);
}

testApi().catch(console.error);
