export interface DemoItem {
  id: string;
  demoId: string; // e.g. DEM-1287
  badge?: string; // 'New' | 'Hot'
  businessName: string;
  businessAddress: string;
  contactPerson: string;
  contactRole: string;
  phone: string;
  email: string;
  demoType: 'Product Demo' | 'Live Demo' | 'Online Demo' | 'POC / Pilot';
  productService: string;
  assignedToName: string;
  assignedToAvatar: string;
  assignedToRole: string;
  demoDate: string; // YYYY-MM-DD or formatted date
  demoTime: string; // 11:00 AM
  status: 'Completed' | 'Scheduled' | 'In Progress' | 'Cancelled';
  outcome?: 'Interested' | 'Demo Done' | 'Not Interested' | 'Quotation Sent' | 'Pending';
  nextAction?: string; // 'Follow-up' | 'Quotation' | 'Send Proposal' | 'Call Before Demo'
  nextActionDate?: string;
  durationMinutes?: number;
  durationFormatted?: string; // e.g. 52m 05s
  revenueValue?: number;
  revenueFormatted?: string; // e.g. ₹ 18,45,000
  conversionPotential?: 'High' | 'Medium' | 'Low';
  probabilityPercentage?: number; // e.g. 80%
  leadSource?: string; // 'Referral' | 'Website' | 'Google Ads' | 'Call' | 'Walk-in'
  leadStage?: 'Interested' | 'Evaluation' | 'Negotiation' | 'Closed Won';
  leadScore?: number; // 4.5/5
  attendeesCount?: number;
  notesSummary?: string;
  lat?: number;
  lng?: number;
}

export interface DemoActivityTimeline {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'status_change' | 'note' | 'attachment' | 'meeting' | 'creation';
  userAvatar?: string;
  userName?: string;
}

export interface DemoNote {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
}

export interface DemoAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

// ─── MOCK DATA FOR DEMO MANAGEMENT (Matching Demo Management Images) ─
export const mockDemosList: DemoItem[] = [
  {
    id: 'DEMO-1001',
    demoId: 'DEM-1287',
    badge: 'New',
    businessName: 'Sai Enterprises',
    businessAddress: 'Marol, Andheri East, Mumbai',
    contactPerson: 'Suresh Patel',
    contactRole: 'Proprietor',
    phone: '+91 98765 43210',
    email: 'suresh@saienterprises.com',
    demoType: 'Product Demo',
    productService: 'Smart Field ERP & Mobile App',
    assignedToName: 'Arjun Mehta',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '20 May 2025',
    demoTime: '11:00 AM',
    status: 'Completed',
    outcome: 'Interested',
    nextAction: 'Follow-up',
    nextActionDate: '23 May 2025',
    durationMinutes: 55,
    durationFormatted: '55m 12s',
    revenueValue: 1845000,
    revenueFormatted: '₹ 18,45,000',
    conversionPotential: 'High',
    probabilityPercentage: 85,
    leadSource: 'Referral',
    leadStage: 'Interested',
    leadScore: 4.8,
    attendeesCount: 3,
    notesSummary: 'Customer liked live GPS tracking and automated visit reporting features.',
    lat: 19.118,
    lng: 72.868,
  },
  {
    id: 'DEMO-1002',
    demoId: 'DEM-1286',
    badge: 'New',
    businessName: 'Sharma Medical Store',
    businessAddress: 'Saki Naka, Andheri East, Mumbai',
    contactPerson: 'Neha Sharma',
    contactRole: 'Pharmacist',
    phone: '+91 98200 11223',
    email: 'sharma.med@gmail.com',
    demoType: 'Product Demo',
    productService: 'Inventory & Field Executive CRM',
    assignedToName: 'Neha Sharma',
    assignedToAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '20 May 2025',
    demoTime: '02:30 PM',
    status: 'Scheduled',
    outcome: 'Pending',
    nextAction: 'Call Before Demo',
    nextActionDate: '20 May 2025',
    durationMinutes: 45,
    durationFormatted: '45m 00s',
    revenueValue: 1200000,
    revenueFormatted: '₹ 12,00,000',
    conversionPotential: 'High',
    probabilityPercentage: 75,
    leadSource: 'Google Ads',
    leadStage: 'Evaluation',
    leadScore: 4.2,
    attendeesCount: 2,
    notesSummary: 'Demo scheduled at pharmacy head office.',
    lat: 19.125,
    lng: 72.875,
  },
  {
    id: 'DEMO-1003',
    demoId: 'DEM-1285',
    badge: 'Hot',
    businessName: 'Royal Bakers',
    businessAddress: 'Chakala, Andheri East, Mumbai',
    contactPerson: 'Rahul Gupta',
    contactRole: 'Owner',
    phone: '+91 99303 22110',
    email: 'rahul.gupta@royalbakers.com',
    demoType: 'Live Demo',
    productService: 'SFW Local SEO & CRM',
    assignedToName: 'Pooja Yadav',
    assignedToAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '19 May 2025',
    demoTime: '04:00 PM',
    status: 'Completed',
    outcome: 'Demo Done',
    nextAction: 'Quotation',
    nextActionDate: '21 May 2025',
    durationMinutes: 52,
    durationFormatted: '52m 05s',
    revenueValue: 1845000,
    revenueFormatted: '₹ 18,45,000',
    conversionPotential: 'High',
    probabilityPercentage: 80,
    leadSource: 'Referral',
    leadStage: 'Interested',
    leadScore: 4.5,
    attendeesCount: 2,
    notesSummary: 'Customer liked the automated review feature and website builder. They requested proposal with 3 months plan.',
    lat: 19.112,
    lng: 72.86,
  },
  {
    id: 'DEMO-1004',
    demoId: 'DEM-1284',
    businessName: 'Metro Supermart',
    businessAddress: 'Andheri West, Mumbai',
    contactPerson: 'Amit Jain',
    contactRole: 'Manager',
    phone: '+91 98190 77889',
    email: 'admin@metrosuper.com',
    demoType: 'Online Demo',
    productService: 'Retail Supply Chain Tracker',
    assignedToName: 'Rakesh Patel',
    assignedToAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '19 May 2025',
    demoTime: '11:30 AM',
    status: 'In Progress',
    outcome: 'Pending',
    nextAction: 'Send Proposal',
    nextActionDate: '20 May 2025',
    durationMinutes: 40,
    durationFormatted: '40m 10s',
    revenueValue: 2400000,
    revenueFormatted: '₹ 24,00,000',
    conversionPotential: 'High',
    probabilityPercentage: 90,
    leadSource: 'Website',
    leadStage: 'Negotiation',
    leadScore: 4.9,
    attendeesCount: 5,
    notesSummary: 'Online screen sharing active for multi-outlet retail management.',
    lat: 19.13,
    lng: 72.88,
  },
  {
    id: 'DEMO-1005',
    demoId: 'DEM-1283',
    businessName: 'Patel Electronics',
    businessAddress: 'Jogeshwari West, Mumbai',
    contactPerson: 'Vijay Patel',
    contactRole: 'Owner',
    phone: '+91 97690 44556',
    email: 'vijay@patelelectronics.com',
    demoType: 'Product Demo',
    productService: 'Smart Field ERP',
    assignedToName: 'Arjun Mehta',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '18 May 2025',
    demoTime: '03:00 PM',
    status: 'Completed',
    outcome: 'Interested',
    nextAction: 'Follow-up',
    nextActionDate: '21 May 2025',
    durationMinutes: 48,
    durationFormatted: '48m 50s',
    revenueValue: 1600000,
    revenueFormatted: '₹ 16,00,000',
    conversionPotential: 'Medium',
    probabilityPercentage: 65,
    leadSource: 'Walk-in',
    leadStage: 'Evaluation',
    leadScore: 3.9,
    attendeesCount: 2,
    notesSummary: 'Demonstrated warranty management module.',
    lat: 19.115,
    lng: 72.865,
  },
  {
    id: 'DEMO-1006',
    demoId: 'DEM-1282',
    businessName: 'Om Enterprises',
    businessAddress: 'Oshiwara, Andheri W, Mumbai',
    contactPerson: 'Mahesh Shah',
    contactRole: 'Partner',
    phone: '+91 97020 55678',
    email: 'contact@omhardware.com',
    demoType: 'Live Demo',
    productService: 'B2B Sales CRM',
    assignedToName: 'Kiran Jadhav',
    assignedToAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '18 May 2025',
    demoTime: '12:00 PM',
    status: 'Cancelled',
    outcome: 'Not Interested',
    nextAction: '—',
    durationMinutes: 15,
    durationFormatted: '15m 00s',
    revenueValue: 0,
    revenueFormatted: '₹ 0',
    conversionPotential: 'Low',
    probabilityPercentage: 0,
    leadSource: 'Trade Show',
    leadStage: 'Closed Won',
    leadScore: 2.0,
    attendeesCount: 1,
    notesSummary: 'Client cancelled due to budget constraints.',
    lat: 19.14,
    lng: 72.89,
  },
  {
    id: 'DEMO-1007',
    demoId: 'DEM-1281',
    businessName: 'Fresh & Green',
    businessAddress: 'Versova, Andheri W, Mumbai',
    contactPerson: 'Ramesh Yadav',
    contactRole: 'Owner',
    phone: '+91 96540 88990',
    email: 'freshgreen@gmail.com',
    demoType: 'Product Demo',
    productService: 'Fresh Grocery Delivery & FE Tracker',
    assignedToName: 'Pooja Yadav',
    assignedToAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '17 May 2025',
    demoTime: '01:30 PM',
    status: 'Scheduled',
    outcome: 'Pending',
    nextAction: 'Call Before Demo',
    nextActionDate: '17 May 2025',
    durationMinutes: 30,
    durationFormatted: '30m 00s',
    revenueValue: 1100000,
    revenueFormatted: '₹ 11,00,000',
    conversionPotential: 'High',
    probabilityPercentage: 70,
    leadSource: 'Facebook Ads',
    leadStage: 'Interested',
    leadScore: 4.1,
    attendeesCount: 2,
    notesSummary: 'Scheduled live demo at store.',
    lat: 19.122,
    lng: 72.87,
  },
  {
    id: 'DEMO-1008',
    demoId: 'DEM-1280',
    businessName: 'Anand Fashion',
    businessAddress: 'Andheri East, Mumbai',
    contactPerson: 'Anand Verma',
    contactRole: 'Manager',
    phone: '+91 98210 66778',
    email: 'anand.fashion@gmail.com',
    demoType: 'Online Demo',
    productService: 'Apparel POS & Field Sales',
    assignedToName: 'Neha Sharma',
    assignedToAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    assignedToRole: 'Field Executive',
    demoDate: '16 May 2025',
    demoTime: '05:00 PM',
    status: 'Completed',
    outcome: 'Demo Done',
    nextAction: 'Quotation',
    nextActionDate: '19 May 2025',
    durationMinutes: 39,
    durationFormatted: '39m 40s',
    revenueValue: 1350000,
    revenueFormatted: '₹ 13,50,000',
    conversionPotential: 'Medium',
    probabilityPercentage: 60,
    leadSource: 'Instagram',
    leadStage: 'Evaluation',
    leadScore: 3.8,
    attendeesCount: 3,
    notesSummary: 'Showed multi-store inventory sync.',
    lat: 19.117,
    lng: 72.862,
  },
];

// Helper data fetching functions for connectivity
export function getDemoById(id: string): DemoItem | undefined {
  return mockDemosList.find((d) => d.id === id || d.demoId === id);
}

export function filterDemosByStatus(status?: string): DemoItem[] {
  if (!status || status === 'All') return mockDemosList;
  return mockDemosList.filter((d) => d.status.toLowerCase() === status.toLowerCase());
}
