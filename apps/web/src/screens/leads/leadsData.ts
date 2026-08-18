export interface LeadItem {
  id: string;
  code: string; // e.g. "LD-1001"
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  designation: string;
  region: string;
  city: string;
  territory: string;
  leadSource: 'Website' | 'Field Visit' | 'Referral' | 'LinkedIn' | 'Inbound Call' | 'Cold Outreach' | 'Trade Show';
  stage: 'New / Fresh' | 'Contacted' | 'Meeting Scheduled' | 'Demo Completed' | 'Proposal Sent' | 'Negotiation' | 'Won / Converted' | 'Lost' | 'Not Interested' | 'Duplicate';
  status: 'Fresh' | 'Hot' | 'Warm' | 'Cold' | 'Unassigned' | 'Follow-up' | 'Converted' | 'Lost' | 'Not Interested' | 'Duplicate';
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  score: number; // 0 - 100
  estimatedValue: number; // in ₹
  probabilityPct: number;
  assignedLeader: string; // TL Name
  assignedLeaderCode: string;
  assignedExecutive: string; // Field Exec Name
  assignedExecutiveCode: string;
  assignedExecutiveAvatar: string;
  createdDate: string;
  lastContactDate: string;
  nextFollowUpDate: string;
  address: string;
  industry: string;
  requirementNotes: string;
  lostReason?: string;
}

export interface LeadTimelineEvent {
  id: string;
  leadId: string;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actorAvatar: string;
  type: 'stage_change' | 'visit' | 'call' | 'demo' | 'email' | 'assignment' | 'note' | 'payment';
}

export interface LeadVisitItem {
  id: string;
  leadId: string;
  executiveName: string;
  executiveAvatar: string;
  checkInTime: string;
  checkOutTime?: string;
  durationMinutes: number;
  location: string;
  lat: number;
  lng: number;
  purpose: string;
  outcome: string;
  photos: string[];
  status: 'Completed' | 'In Progress' | 'Scheduled';
}

export interface LeadFollowUpItem {
  id: string;
  leadId: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedTo: string;
  type: 'Call' | 'Site Visit' | 'Demo Session' | 'Proposal Follow-up' | 'Payment Follow-up';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled';
  notes?: string;
}

export interface LeadDemoItem {
  id: string;
  leadId: string;
  demoTitle: string;
  conductedBy: string;
  conductedByAvatar: string;
  demoDate: string;
  demoMode: 'In-Person / Onsite' | 'Virtual Video Call' | 'Product Walkthrough';
  attendeesCount: number;
  feedbackRating: number; // 1 to 5
  keyQuestions: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
}

export interface LeadCommunicationItem {
  id: string;
  leadId: string;
  channel: 'Call' | 'Email' | 'WhatsApp' | 'In-Person';
  subject: string;
  details: string;
  direction: 'Inbound' | 'Outbound';
  timestamp: string;
  loggedBy: string;
  loggedByAvatar: string;
}

export interface LeadPaymentItem {
  id: string;
  leadId: string;
  invoiceNo: string;
  amount: number;
  paymentType: 'Advance Token' | 'First Milestone' | 'Final Settlement' | 'Full Contract Amount';
  paymentMode: 'UPI / Bank Transfer' | 'Cheque' | 'Credit Card' | 'Net Banking';
  paymentDate: string;
  status: 'Received' | 'Pending Approval' | 'Overdue';
  receiptUrl?: string;
  txnRef: string;
}

export const mockLeadsData: LeadItem[] = [
  {
    id: 'LD-1001',
    code: 'LD-1001',
    companyName: 'Skyline Real Estate Corp',
    contactPerson: 'Rohan Sharma',
    email: 'rohan.sharma@skylinerealty.com',
    phone: '+91 98201 44512',
    secondaryPhone: '+91 98201 44513',
    designation: 'Managing Director',
    region: 'North Mumbai Region',
    city: 'Mumbai',
    territory: 'Andheri West',
    leadSource: 'Website',
    stage: 'Proposal Sent',
    status: 'Hot',
    priority: 'High',
    score: 92,
    estimatedValue: 1850000,
    probabilityPct: 80,
    assignedLeader: 'Sanjay Yadav',
    assignedLeaderCode: 'TL-1003',
    assignedExecutive: 'Rahul Verma',
    assignedExecutiveCode: 'FE-1001',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdDate: '10 May 2025',
    lastContactDate: '17 May 2025, 04:30 PM',
    nextFollowUpDate: '19 May 2025, 11:00 AM',
    address: 'Plot 42, Link Road, Andheri West, Mumbai, MH - 400053',
    industry: 'Real Estate & Infrastructure',
    requirementNotes: 'Interested in enterprise GPS field tracking suite for 45 sales executives with custom mobile app check-ins.',
  },
  {
    id: 'LD-1002',
    code: 'LD-1002',
    companyName: 'Apex Healthtech Pvt Ltd',
    contactPerson: 'Ananya Deshmukh',
    email: 'ananya@apexhealth.in',
    phone: '+91 98192 11099',
    designation: 'VP Operations',
    region: 'Western Suburbs',
    city: 'Mumbai',
    territory: 'Bandra Kurla Complex',
    leadSource: 'Field Visit',
    stage: 'Demo Completed',
    status: 'Hot',
    priority: 'Urgent',
    score: 88,
    estimatedValue: 1200000,
    probabilityPct: 75,
    assignedLeader: 'Priya Mehta',
    assignedLeaderCode: 'TL-1007',
    assignedExecutive: 'Priya Mehta',
    assignedExecutiveCode: 'FE-1002',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    createdDate: '12 May 2025',
    lastContactDate: '16 May 2025, 02:15 PM',
    nextFollowUpDate: '20 May 2025, 02:00 PM',
    address: 'Maker Maxity, BKC, Bandra East, Mumbai, MH - 400051',
    industry: 'Healthcare & Pharmaceuticals',
    requirementNotes: 'Needs live GPS tracking and medical rep visit log management across 30 territories in Maharashtra.',
  },
  {
    id: 'LD-1003',
    code: 'LD-1003',
    companyName: 'Zenith Logistics & Supply Chain',
    contactPerson: 'Vikram Merchant',
    email: 'v.merchant@zenithlogistics.com',
    phone: '+91 97690 33412',
    designation: 'Head of Logistics',
    region: 'Eastern Suburbs',
    city: 'Mumbai',
    territory: 'Vikhroli East',
    leadSource: 'Inbound Call',
    stage: 'New / Fresh',
    status: 'Unassigned',
    priority: 'Medium',
    score: 65,
    estimatedValue: 950000,
    probabilityPct: 40,
    assignedLeader: 'Rohit Singh',
    assignedLeaderCode: 'TL-1011',
    assignedExecutive: 'Unassigned',
    assignedExecutiveCode: 'NONE',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    createdDate: '15 May 2025',
    lastContactDate: '15 May 2025, 06:00 PM',
    nextFollowUpDate: '19 May 2025, 10:00 AM',
    address: 'Godrej One, Vikhroli East, Mumbai, MH - 400079',
    industry: 'Logistics & Transportation',
    requirementNotes: 'Inbound inquiry requesting fleet & delivery executive tracking integration with ERP.',
  },
  {
    id: 'LD-1004',
    code: 'LD-1004',
    companyName: 'Nova Financial Services Solutions',
    contactPerson: 'Rajesh Kulkarni',
    email: 'rkulkarni@novafinance.co.in',
    phone: '+91 98210 55432',
    designation: 'Chief Revenue Officer',
    region: 'Thane & Navi Mumbai',
    city: 'Thane',
    territory: 'Thane West',
    leadSource: 'Referral',
    stage: 'Negotiation',
    status: 'Follow-up',
    priority: 'High',
    score: 95,
    estimatedValue: 2400000,
    probabilityPct: 90,
    assignedLeader: 'Karan Patil',
    assignedLeaderCode: 'TL-1009',
    assignedExecutive: 'Karan Patil',
    assignedExecutiveCode: 'FE-1009',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdDate: '04 May 2025',
    lastContactDate: '17 May 2025, 05:00 PM',
    nextFollowUpDate: '19 May 2025, 04:00 PM',
    address: 'Wagle Industrial Estate, Thane West, MH - 400604',
    industry: 'Banking & Financial Services',
    requirementNotes: 'Final contract negotiations ongoing for 120 loan verification field agents.',
  },
  {
    id: 'LD-1005',
    code: 'LD-1005',
    companyName: 'BuildTech Infrastructure Ltd',
    contactPerson: 'Sandeep Patil',
    email: 'sandeep@buildtechinfra.com',
    phone: '+91 98334 77123',
    designation: 'General Manager - Projects',
    region: 'Pune City & PCMC',
    city: 'Pune',
    territory: 'Baner',
    leadSource: 'Cold Outreach',
    stage: 'Won / Converted',
    status: 'Converted',
    priority: 'High',
    score: 99,
    estimatedValue: 3100000,
    probabilityPct: 100,
    assignedLeader: 'Neha Deshpande',
    assignedLeaderCode: 'TL-1014',
    assignedExecutive: 'Neha Deshpande',
    assignedExecutiveCode: 'FE-1014',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    createdDate: '28 Apr 2025',
    lastContactDate: '14 May 2025, 01:00 PM',
    nextFollowUpDate: 'N/A - Closed Won',
    address: 'Baner IT Park, Baner, Pune, MH - 411045',
    industry: 'Construction & Real Estate',
    requirementNotes: 'Closed deal for 80 site inspectors with geo-fenced attendance tracking and automated PDF report generation.',
  },
  {
    id: 'LD-1006',
    code: 'LD-1006',
    companyName: 'Trident Consumer Products',
    contactPerson: 'Megha Iyer',
    email: 'megha.iyer@tridentgoods.com',
    phone: '+91 99201 88344',
    designation: 'Sales Director',
    region: 'Nagpur Region',
    city: 'Nagpur',
    territory: 'Civil Lines',
    leadSource: 'Trade Show',
    stage: 'Lost',
    status: 'Lost',
    priority: 'Low',
    score: 25,
    estimatedValue: 600000,
    probabilityPct: 0,
    assignedLeader: 'Amit Kale',
    assignedLeaderCode: 'TL-1016',
    assignedExecutive: 'Amit Kale',
    assignedExecutiveCode: 'FE-1016',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdDate: '01 May 2025',
    lastContactDate: '10 May 2025, 11:30 AM',
    nextFollowUpDate: 'N/A - Closed Lost',
    address: 'Civil Lines, Nagpur, MH - 440001',
    industry: 'FMCG & Consumer Goods',
    requirementNotes: 'Lost to competitor due to legacy hardware dependency requirements.',
    lostReason: 'Price Sensitivity & Competitor Lock-in',
  },
  {
    id: 'LD-1007',
    code: 'LD-1007',
    companyName: 'Vanguard Security Solutions',
    contactPerson: 'Deepak Shah',
    email: 'd.shah@vanguardsec.in',
    phone: '+91 98205 99112',
    designation: 'Head of Operations',
    region: 'Surat & South Gujarat',
    city: 'Surat',
    territory: 'Ring Road',
    leadSource: 'LinkedIn',
    stage: 'Not Interested',
    status: 'Not Interested',
    priority: 'Low',
    score: 15,
    estimatedValue: 450000,
    probabilityPct: 0,
    assignedLeader: 'Vishal Shah',
    assignedLeaderCode: 'TL-1017',
    assignedExecutive: 'Vishal Shah',
    assignedExecutiveCode: 'FE-1017',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    createdDate: '05 May 2025',
    lastContactDate: '08 May 2025, 03:00 PM',
    nextFollowUpDate: 'N/A - Not Interested',
    address: 'Ring Road Commercial Hub, Surat, GJ - 395002',
    industry: 'Security & Manned Guarding',
    requirementNotes: 'Already using in-house biometric system; no requirement for mobile app field tracking.',
  },
  {
    id: 'LD-1008',
    code: 'LD-1008',
    companyName: 'Skyline Real Estate Corp (Duplicate)',
    contactPerson: 'Rohan Sharma (Office)',
    email: 'info@skylinerealty.com',
    phone: '+91 98201 44512',
    designation: 'Admin Office',
    region: 'North Mumbai Region',
    city: 'Mumbai',
    territory: 'Andheri West',
    leadSource: 'Website',
    stage: 'Duplicate',
    status: 'Duplicate',
    priority: 'Low',
    score: 10,
    estimatedValue: 1850000,
    probabilityPct: 0,
    assignedLeader: 'Sanjay Yadav',
    assignedLeaderCode: 'TL-1003',
    assignedExecutive: 'Rahul Verma',
    assignedExecutiveCode: 'FE-1001',
    assignedExecutiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdDate: '11 May 2025',
    lastContactDate: '11 May 2025, 05:00 PM',
    nextFollowUpDate: 'N/A - Duplicate Lead',
    address: 'Andheri West, Mumbai, MH - 400053',
    industry: 'Real Estate & Infrastructure',
    requirementNotes: 'Duplicate web form submission matched with LD-1001.',
  },
];

export const mockLeadTimelineEvents: LeadTimelineEvent[] = [
  {
    id: 't-1',
    leadId: 'LD-1001',
    title: 'Proposal Document Submitted',
    description: 'Submitted customized Enterprise SaaS Proposal (v2.4) with special pricing for 45 field licenses.',
    timestamp: '17 May 2025, 04:30 PM',
    actorName: 'Rahul Verma',
    actorRole: 'Field Executive',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    type: 'stage_change',
  },
  {
    id: 't-2',
    leadId: 'LD-1001',
    title: 'Product Walkthrough Demo Completed',
    description: 'Conducted live product demonstration for MD Rohan Sharma & 3 sales managers at Skyline HQ.',
    timestamp: '15 May 2025, 02:00 PM',
    actorName: 'Sanjay Yadav',
    actorRole: 'Team Leader',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    type: 'demo',
  },
  {
    id: 't-3',
    leadId: 'LD-1001',
    title: 'On-Site Geotagged Field Visit',
    description: 'Field check-in completed at Skyline HQ, Link Road. Discussed team hierarchy & territory mapping.',
    timestamp: '14 May 2025, 11:30 AM',
    actorName: 'Rahul Verma',
    actorRole: 'Field Executive',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    type: 'visit',
  },
  {
    id: 't-4',
    leadId: 'LD-1001',
    title: 'Token Advance Received',
    description: 'Received advance token payment ₹1,50,000 via NEFT (Ref: TXN-99812411).',
    timestamp: '12 May 2025, 10:15 AM',
    actorName: 'System Finance',
    actorRole: 'Automated System',
    actorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    type: 'payment',
  },
];

export const mockLeadVisits: LeadVisitItem[] = [
  {
    id: 'v-101',
    leadId: 'LD-1001',
    executiveName: 'Rahul Verma',
    executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    checkInTime: '14 May 2025, 11:30 AM',
    checkOutTime: '14 May 2025, 01:15 PM',
    durationMinutes: 105,
    location: 'Skyline HQ, Link Road, Andheri West (19.1311° N, 72.8252° E)',
    lat: 19.1311,
    lng: 72.8252,
    purpose: 'Initial In-Person Requirement Gathering & Infrastructure Survey',
    outcome: 'Met MD Rohan Sharma. Client requested custom mobile app logo branding and daily PDF route summaries.',
    photos: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    ],
    status: 'Completed',
  },
];

export const mockLeadFollowUps: LeadFollowUpItem[] = [
  {
    id: 'f-201',
    leadId: 'LD-1001',
    title: 'Final Commercial Contract Signoff Call',
    scheduledDate: '19 May 2025',
    scheduledTime: '11:00 AM',
    assignedTo: 'Rahul Verma',
    type: 'Proposal Follow-up',
    priority: 'High',
    status: 'Pending',
    notes: 'Review revised SLA terms and confirm deployment start date for 1st June 2025.',
  },
  {
    id: 'f-202',
    leadId: 'LD-1001',
    title: 'Initial Proposal Discussion Call',
    scheduledDate: '16 May 2025',
    scheduledTime: '04:00 PM',
    assignedTo: 'Rahul Verma',
    type: 'Call',
    priority: 'Medium',
    status: 'Completed',
    notes: 'Client agreed to proceed with Tier-1 Enterprise plan.',
  },
];

export const mockLeadDemos: LeadDemoItem[] = [
  {
    id: 'd-301',
    leadId: 'LD-1001',
    demoTitle: 'Visiblo Field Executive & Live Tracking Walkthrough',
    conductedBy: 'Sanjay Yadav',
    conductedByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    demoDate: '15 May 2025, 02:00 PM',
    demoMode: 'In-Person / Onsite',
    attendeesCount: 4,
    feedbackRating: 5,
    keyQuestions: 'Asked about offline GPS sync when field executives are in underground basements or remote sites.',
    status: 'Completed',
  },
];

export const mockLeadCommunications: LeadCommunicationItem[] = [
  {
    id: 'c-401',
    leadId: 'LD-1001',
    channel: 'Call',
    subject: 'Proposal Follow-up Call with MD Rohan Sharma',
    details: 'Discussed pricing discount structure for annual upfront billing vs monthly billing.',
    direction: 'Outbound',
    timestamp: '17 May 2025, 04:30 PM',
    loggedBy: 'Rahul Verma',
    loggedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'c-402',
    leadId: 'LD-1001',
    channel: 'WhatsApp',
    subject: 'Shared Technical SLA & Mobile App Brochure PDF',
    details: 'Sent product documentation link and video tutorial via official WhatsApp API.',
    direction: 'Outbound',
    timestamp: '16 May 2025, 10:15 AM',
    loggedBy: 'Rahul Verma',
    loggedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
];

export const mockLeadPayments: LeadPaymentItem[] = [
  {
    id: 'p-501',
    leadId: 'LD-1001',
    invoiceNo: 'INV-2025-05-881',
    amount: 150000,
    paymentType: 'Advance Token',
    paymentMode: 'UPI / Bank Transfer',
    paymentDate: '12 May 2025',
    status: 'Received',
    txnRef: 'TXN-99812411',
  },
];
