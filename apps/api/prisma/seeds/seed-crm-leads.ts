import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCrmLeads() {
  const membership = await prisma.tenantMembership.findFirst({
    where: { status: 'ACTIVE' },
    select: { id: true, tenantId: true },
  });

  if (!membership) {
    console.error('No active tenant membership found');
    return;
  }

  const { tenantId, id: membershipId } = membership;

  const sources = await prisma.masterValue.findMany({
    where: { definition: { code: 'lead_source' } },
  });

  const fieldVisitId = sources.find((s) => s.code === 'FIELD_VISIT')?.id;
  const referralId = sources.find((s) => s.code === 'REFERRAL')?.id;

  const sampleLeads = [
    {
      leadCode: 'LD-000001',
      name: 'Acme Retail Solutions',
      kind: 'BUSINESS' as const,
      businessName: 'Acme Retail Solutions Pvt Ltd',
      contactName: 'Vikram Malhotra',
      phone: '+91 98765 43210',
      email: 'vikram@acmeretail.in',
      city: 'Mumbai',
      state: 'Maharashtra',
      priority: 'URGENT' as const,
      status: 'OPEN' as const,
      estimatedValue: 450000,
      nextFollowUpAt: new Date(Date.now() + 86400000 * 1),
      nextActionNote: 'Schedule product demo with VP Sales',
      requirementNote: '20 POS Terminal Licenses',
      sourceValueId: fieldVisitId,
    },
    {
      leadCode: 'LD-000002',
      name: 'Apex Logistics Hub',
      kind: 'BUSINESS' as const,
      businessName: 'Apex Logistics Hub',
      contactName: 'Rohan Sharma',
      phone: '+91 98123 45678',
      email: 'rohan.sharma@apexlogistics.com',
      city: 'Bengaluru',
      state: 'Karnataka',
      priority: 'HIGH' as const,
      status: 'QUALIFIED' as const,
      estimatedValue: 780000,
      nextFollowUpAt: new Date(Date.now() + 86400000 * 2),
      nextActionNote: 'Send formal commercial proposal',
      requirementNote: 'Fleet Tracking & Field Executive App',
      sourceValueId: referralId,
    },
    {
      leadCode: 'LD-000003',
      name: 'Horizon Health Corp',
      kind: 'BUSINESS' as const,
      businessName: 'Horizon Health Corp',
      contactName: 'Ananya Deshmukh',
      phone: '+91 99887 76655',
      email: 'ananya@horizonhealth.co.in',
      city: 'Delhi',
      state: 'NCR',
      priority: 'HIGH' as const,
      status: 'OPEN' as const,
      estimatedValue: 320000,
      nextFollowUpAt: new Date(Date.now() + 86400000 * 3),
      nextActionNote: 'On-site medical rep tracking demo',
      requirementNote: 'Territory mapping for 40 field reps',
      sourceValueId: fieldVisitId,
    },
    {
      leadCode: 'LD-000004',
      name: 'Global Tech Distributors',
      kind: 'BUSINESS' as const,
      businessName: 'Global Tech Distributors',
      contactName: 'Siddharth Varma',
      phone: '+91 97654 32109',
      email: 'siddharth@globaltech.io',
      city: 'Hyderabad',
      state: 'Telangana',
      priority: 'MEDIUM' as const,
      status: 'CONVERTED' as const,
      estimatedValue: 1250000,
      convertedAt: new Date(),
      requirementNote: 'Enterprise contract signed for 100 users',
      sourceValueId: referralId,
    },
    {
      leadCode: 'LD-000005',
      name: 'Starlight Enterprises',
      kind: 'INDIVIDUAL' as const,
      businessName: null,
      contactName: 'Rajesh Kumar',
      phone: '+91 96540 88990',
      email: 'rajesh.k@gmail.com',
      city: 'Pune',
      state: 'Maharashtra',
      priority: 'LOW' as const,
      status: 'DISQUALIFIED' as const,
      disqualificationReason: 'LOST',
      estimatedValue: 150000,
      sourceValueId: fieldVisitId,
    },
    {
      leadCode: 'LD-000006',
      name: 'Zenith Pharma Pvt Ltd',
      kind: 'BUSINESS' as const,
      businessName: 'Zenith Pharma Pvt Ltd',
      contactName: 'Pooja Hegde',
      phone: '+91 95432 10987',
      email: 'pooja@zenithpharma.com',
      city: 'Chennai',
      state: 'Tamil Nadu',
      priority: 'URGENT' as const,
      status: 'OPEN' as const,
      estimatedValue: 620000,
      nextFollowUpAt: new Date(Date.now() + 86400000 * 4),
      nextActionNote: 'Follow-up on pricing package decision',
      requirementNote: 'Sample tracking & MR attendance',
      sourceValueId: referralId,
    },
  ];

  for (const item of sampleLeads) {
    const exists = await prisma.lead.findFirst({
      where: { tenantId, leadCode: item.leadCode },
    });

    if (!exists) {
      await prisma.lead.create({
        data: {
          tenantId,
          ownerMembershipId: membershipId,
          assignedMembershipId: membershipId,
          createdByMembershipId: membershipId,
          updatedByMembershipId: membershipId,
          ...item,
        },
      });
      console.log('Created lead:', item.leadCode, item.name);
    }
  }

  console.log('Seed completed successfully!');
}

seedCrmLeads()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
