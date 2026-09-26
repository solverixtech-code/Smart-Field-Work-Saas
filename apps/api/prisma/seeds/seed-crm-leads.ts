import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCrmLeads() {
  const tenantId = process.env.CRM_SEED_TENANT_ID?.trim();
  if (!tenantId) {
    throw new Error('CRM_SEED_TENANT_ID is required. Sample CRM data must be assigned to an explicit demo tenant.');
  }

  const membership = await prisma.tenantMembership.findFirst({
    where: { tenantId, status: 'ACTIVE' },
    select: { id: true, tenantId: true },
  });

  if (!membership) {
    throw new Error(`No active tenant membership found for CRM_SEED_TENANT_ID=${tenantId}`);
  }

  const { id: membershipId } = membership;

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
    let lead = await prisma.lead.findFirst({
      where: { tenantId, leadCode: item.leadCode },
    });

    if (!lead) {
      lead = await prisma.lead.create({
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

    // Seed Sub-Resources for this lead if not present
    const existingVisit = await prisma.leadVisit.findFirst({ where: { tenantId, leadId: lead.id } });
    if (!existingVisit) {
      await prisma.leadVisit.createMany({
        data: [
          {
            tenantId,
            leadId: lead.id,
            executiveMembershipId: membershipId,
            executiveName: 'Priya Sharma',
            executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
            location: `${lead.city || 'Mumbai'} Regional Distribution Center`,
            latitude: 19.082,
            longitude: 72.889,
            purpose: 'Field Executive Mobile App Workflow Walkthrough',
            outcome: 'Demonstrated offline GPS tracking. Client satisfied with battery consumption stats.',
            durationMinutes: 60,
            status: 'COMPLETED',
            checkInTime: new Date(Date.now() - 86400000 * 5),
            checkOutTime: new Date(Date.now() - 86400000 * 5 + 3600000),
          },
          {
            tenantId,
            leadId: lead.id,
            executiveMembershipId: membershipId,
            executiveName: 'Rajesh Kumar',
            executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            location: `${lead.city || 'Mumbai'} Industrial Area - HQ Office`,
            latitude: 19.076,
            longitude: 72.8777,
            purpose: 'Initial Requirements Gathering & Site Inspection',
            outcome: 'Met with Operations VP. Client requested custom attendance geofencing demo for 3 branch offices.',
            durationMinutes: 45,
            status: 'COMPLETED',
            checkInTime: new Date(Date.now() - 86400000 * 2),
            checkOutTime: new Date(Date.now() - 86400000 * 2 + 2700000),
          },
        ],
      });
    }

    const existingFollowUp = await prisma.leadFollowUp.findFirst({ where: { tenantId, leadId: lead.id } });
    if (!existingFollowUp) {
      await prisma.leadFollowUp.createMany({
        data: [
          {
            tenantId,
            leadId: lead.id,
            assignedMembershipId: membershipId,
            assignedToName: 'Rajesh Kumar',
            title: 'Call VP Sales regarding contract review',
            scheduledDate: '2026-09-24',
            scheduledTime: '11:30 AM',
            notes: 'Confirm if legal team approved the SLA clauses.',
            status: 'Pending',
          },
          {
            tenantId,
            leadId: lead.id,
            assignedMembershipId: membershipId,
            assignedToName: 'Priya Sharma',
            title: 'Share custom pricing quotation PDF',
            scheduledDate: '2026-09-20',
            scheduledTime: '03:00 PM',
            notes: 'Sent via official email and WhatsApp broadcast.',
            status: 'Completed',
            completedAt: new Date(Date.now() - 86400000),
          },
        ],
      });
    }

    const existingDemo = await prisma.leadDemo.findFirst({ where: { tenantId, leadId: lead.id } });
    if (!existingDemo) {
      await prisma.leadDemo.createMany({
        data: [
          {
            tenantId,
            leadId: lead.id,
            conductedByMembershipId: membershipId,
            conductedByName: 'Vikram Malhotra',
            conductedByAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
            demoTitle: 'Solverix Smart Field Work Platform Overview',
            demoDate: '2026-09-18',
            demoMode: 'Virtual Google Meet',
            attendeesCount: 4,
            feedbackRating: 5.0,
            keyQuestions: 'How does live location tracking handle poor network areas in remote zones?',
            status: 'COMPLETED',
          },
        ],
      });
    }

    const existingComm = await prisma.leadCommunication.findFirst({ where: { tenantId, leadId: lead.id } });
    if (!existingComm) {
      await prisma.leadCommunication.createMany({
        data: [
          {
            tenantId,
            leadId: lead.id,
            loggedByMembershipId: membershipId,
            loggedByName: 'Rajesh Kumar',
            loggedByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            channel: 'Call',
            direction: 'Outbound',
            subject: 'Discussed Enterprise Licensing & Deployment Timeline',
            details: 'Client confirmed budget allocation for Q3 rollout.',
            timestamp: new Date(Date.now() - 86400000 * 3),
          },
          {
            tenantId,
            leadId: lead.id,
            loggedByMembershipId: membershipId,
            loggedByName: 'Priya Sharma',
            loggedByAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
            channel: 'Email',
            direction: 'Outbound',
            subject: 'Sent Technical Architecture & Security Compliance Document',
            details: 'Included ISO 27001 certificate and SOC2 audit summary.',
            timestamp: new Date(Date.now() - 86400000 * 4),
          },
        ],
      });
    }
  }

  console.log('Seed completed successfully with dynamic sub-resources & avatars!');
}

seedCrmLeads()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
