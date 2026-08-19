export interface BusinessItem {
  id: string;
  name: string;
  logoBg: string;
  logoText: string;
  logoUrl?: string;
  businessType: string;
  category: string;
  city: string;
  address: string;
  fullAddress: string;
  contactPerson: string;
  contactRole: string;
  phone: string;
  email: string;
  source: string;
  assignedToName: string;
  assignedToRole: string;
  assignedToAvatar: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  lastActivity: string;
  establishedYear: number;
  employees: string;
  annualRevenue: string;
  gstin: string;
  website: string;
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  wonLeads: number;
  lostLeads: number;
  followUpLeads: number;
  serviceAreas: string[];
  languages: string[];
  businessHours: string;
  description: string;
}

export interface BusinessContactItem {
  id: string;
  businessId: string;
  name: string;
  avatar: string;
  role: 'Owner' | 'Manager' | 'Operations Head' | 'Sales Head' | 'Customer Support' | 'Trainer' | 'Accountant';
  roleBadgeColor: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  addedOn: string;
  addedByName: string;
  addedByRole: string;
}

export interface GoogleProfileData {
  profileId: string;
  status: 'Live on Google' | 'Pending Verification' | 'Suspended';
  verified: boolean;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  website: string;
  category: string;
  createdOn: string;
  lastUpdated: string;
  connectedOn: string;
  connectedBy: string;
  completenessPct: number;
  insights: {
    views: number;
    searches: number;
    mapViews: number;
    websiteClicks: number;
    calls: number;
    directionRequests: number;
  };
  reviews: Array<{
    id: string;
    author: string;
    avatar: string;
    rating: number;
    timeAgo: string;
    comment: string;
  }>;
  posts: Array<{
    id: string;
    title: string;
    date: string;
    views: number;
    image: string;
  }>;
}

export interface SalesOrderItem {
  id: string;
  invoiceId: string;
  orderDate: string;
  orderType: 'Service' | 'Membership' | 'Product' | 'Consulting';
  itemsCount: number;
  amount: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface BusinessVisitItem {
  id: string;
  visitCode: string;
  date: string;
  executiveName: string;
  executiveAvatar: string;
  visitType: 'Sales Visit' | 'Follow-up' | 'Collection' | 'Product Demo' | 'Onboarding';
  purpose: string;
  status: 'Completed' | 'In Progress' | 'Cancelled' | 'No Show';
  duration: string;
  notes: string;
}

export interface SubscriptionData {
  subscriptionId: string;
  planName: string;
  planBadge: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Annual';
  status: 'Active' | 'Cancelled' | 'Expired';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amountExclTax: number;
  amountInclTax: number;
  autoRenewal: boolean;
  usage: {
    aiPostCredits: { used: number; total: number };
    reviewReplies: { used: number; total: number };
    teamMembers: { used: number; total: number };
  };
  features: string[];
  history: Array<{
    subscriptionId: string;
    planName: string;
    billingCycle: string;
    amountInclTax: number;
    status: 'Active' | 'Cancelled';
    startDate: string;
    endDate: string;
    paymentMethod: string;
  }>;
}

export const mockBusinesses: BusinessItem[] = [
  {
    id: 'BUS-10058242',
    name: 'FitZone Gym',
    logoBg: 'bg-amber-100 text-amber-800',
    logoText: 'FZ',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=120&q=80',
    businessType: 'Gym / Fitness Center',
    category: 'Health & Fitness',
    city: 'Mumbai',
    address: '12, 1st Floor, Orion Mall, Dr. C. H. Street',
    fullAddress: 'Shop No. 12, 1st Floor, Orion Mall, Dr. C. H. Street, Mumbai, Maharashtra 400001',
    contactPerson: 'Amit Verma',
    contactRole: 'Owner',
    phone: '+91 98765 43210',
    email: 'info@fitzonegym.com',
    source: 'Website',
    assignedToName: 'Vikram Patil',
    assignedToRole: 'Sales Manager',
    assignedToAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    lastActivity: 'May 18, 2025 10:30 AM',
    establishedYear: 2020,
    employees: '15 - 25',
    annualRevenue: '₹ 50 Lakhs - ₹ 1 Cr',
    gstin: '27ABCDE1234F1Z5',
    website: 'https://fitzonegym.com',
    totalLeads: 156,
    activeLeads: 89,
    convertedLeads: 42,
    wonLeads: 28,
    lostLeads: 18,
    followUpLeads: 31,
    serviceAreas: ['Mumbai', 'Navi Mumbai', 'Thane'],
    languages: ['English', 'Hindi', 'Marathi'],
    businessHours: '06:00 AM - 11:00 PM (Open All Days)',
    description: 'FitZone Gym is a modern fitness center offering state-of-the-art equipment, personal training, group classes, and customized fitness programs. Our mission is to help people achieve a healthier lifestyle.',
  },
  {
    id: 'BUS-1005841',
    name: 'GreenLeaf Cafe',
    logoBg: 'bg-emerald-100 text-emerald-800',
    logoText: 'GC',
    businessType: 'Food & Beverage',
    category: 'Restaurant & Cafe',
    city: 'Pune',
    address: 'FC Road, Near Ferguson College',
    fullAddress: 'Plot 45, FC Road, Shivajinagar, Pune, Maharashtra 411004',
    contactPerson: 'Neha Gupta',
    contactRole: 'Proprietor',
    phone: '+91 98234 56789',
    email: 'neha@greenleaf.com',
    source: 'Referral',
    assignedToName: 'Neha Gupta',
    assignedToRole: 'Team Leader',
    assignedToAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    lastActivity: 'May 18, 2025 09:45 AM',
    establishedYear: 2019,
    employees: '10 - 20',
    annualRevenue: '₹ 30 Lakhs - ₹ 60 Lakhs',
    gstin: '27FGHIJ5678K1Z2',
    website: 'https://greenleafcafe.in',
    totalLeads: 84,
    activeLeads: 45,
    convertedLeads: 22,
    wonLeads: 18,
    lostLeads: 8,
    followUpLeads: 12,
    serviceAreas: ['Pune', 'Pimpri-Chinchwad'],
    languages: ['English', 'Hindi', 'Marathi'],
    businessHours: '08:00 AM - 10:30 PM',
    description: 'Organic cafe serving artisanal coffee, healthy smoothies, and plant-based gourmet meals.',
  },
  {
    id: 'BUS-1005840',
    name: 'Shield Security Services',
    logoBg: 'bg-blue-100 text-blue-800',
    logoText: 'SS',
    businessType: 'Security Services',
    category: 'Enterprise Services',
    city: 'Thane',
    address: 'Wagle Estate, Industrial Area',
    fullAddress: 'Unit 302, Wagle Estate, Thane West, Maharashtra 400604',
    contactPerson: 'Ravi Sharma',
    contactRole: 'Director',
    phone: '+91 97654 32101',
    email: 'ravi@shieldsec.com',
    source: 'Google Ads',
    assignedToName: 'Ankush Yadav',
    assignedToRole: 'Sr. Executive',
    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    lastActivity: 'May 17, 2025 06:20 PM',
    establishedYear: 2015,
    employees: '50+',
    annualRevenue: '₹ 2 Cr - ₹ 5 Cr',
    gstin: '27KLMNO9012P1Z8',
    website: 'https://shieldsec.com',
    totalLeads: 120,
    activeLeads: 62,
    convertedLeads: 38,
    wonLeads: 30,
    lostLeads: 12,
    followUpLeads: 20,
    serviceAreas: ['Mumbai', 'Thane', 'Navi Mumbai'],
    languages: ['English', 'Hindi'],
    businessHours: '24/7 Operations',
    description: 'Premier security manpower and AI surveillance consulting firm for commercial facilities.',
  },
  {
    id: 'BUS-1005839',
    name: 'BuildPro Construction',
    logoBg: 'bg-amber-100 text-amber-800',
    logoText: 'BP',
    businessType: 'Construction',
    category: 'Real Estate & Infra',
    city: 'Navi Mumbai',
    address: 'Sector 17, Vashi',
    fullAddress: 'Tower B, Sector 17, Vashi, Navi Mumbai, Maharashtra 400703',
    contactPerson: 'Pooja Jadhav',
    contactRole: 'Manager',
    phone: '+91 98989 98899',
    email: 'pooja@buildpro.in',
    source: 'Justdial',
    assignedToName: 'Pooja Jadhav',
    assignedToRole: 'Sr. Executive',
    assignedToAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    status: 'Inactive',
    lastActivity: 'May 17, 2025 11:15 AM',
    establishedYear: 2017,
    employees: '30 - 50',
    annualRevenue: '₹ 1 Cr - ₹ 3 Cr',
    gstin: '27QRSTU3456V1Z9',
    website: 'https://buildpro.in',
    totalLeads: 42,
    activeLeads: 12,
    convertedLeads: 15,
    wonLeads: 10,
    lostLeads: 8,
    followUpLeads: 4,
    serviceAreas: ['Navi Mumbai', 'Panvel'],
    languages: ['English', 'Marathi'],
    businessHours: '09:00 AM - 07:00 PM',
    description: 'Commercial construction contractors specializing in modern retail store build-outs.',
  },
  {
    id: 'BUS-1005838',
    name: 'SuperMart Retail',
    logoBg: 'bg-purple-100 text-purple-800',
    logoText: 'SR',
    businessType: 'Retail Supermarket',
    category: 'FMCG & Grocery',
    city: 'Mumbai',
    address: 'Andheri West Market',
    fullAddress: 'Plot 108, SV Road, Andheri West, Mumbai, Maharashtra 400058',
    contactPerson: 'Karan Mehta',
    contactRole: 'Operations Head',
    phone: '+91 98111 22333',
    email: 'karan@supermart.com',
    source: 'Cold Call',
    assignedToName: 'Vikram Patil',
    assignedToRole: 'Sales Manager',
    assignedToAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    status: 'Active',
    lastActivity: 'May 16, 2025 04:30 PM',
    establishedYear: 2012,
    employees: '40+',
    annualRevenue: '₹ 3 Cr - ₹ 8 Cr',
    gstin: '27VWXYZ7890A1Z4',
    website: 'https://supermartretail.com',
    totalLeads: 195,
    activeLeads: 110,
    convertedLeads: 55,
    wonLeads: 45,
    lostLeads: 20,
    followUpLeads: 35,
    serviceAreas: ['Mumbai Western Suburbs'],
    languages: ['English', 'Hindi', 'Gujarati'],
    businessHours: '07:30 AM - 10:00 PM',
    description: 'Multi-aisle supermarket franchise leveraging AI for automated inventory & billing.',
  },
  {
    id: 'BUS-1005837',
    name: 'Glow Beauty Salon',
    logoBg: 'bg-pink-100 text-pink-800',
    logoText: 'GB',
    businessType: 'Beauty & Salon',
    category: 'Wellness',
    city: 'Mumbai',
    address: 'Bandra West, Hill Road',
    fullAddress: 'Shop 4, Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    contactPerson: 'Deepak Patel',
    contactRole: 'Owner',
    phone: '+91 93211 44556',
    email: 'deepak@glowsalon.in',
    source: 'Instagram',
    assignedToName: 'Neha Gupta',
    assignedToRole: 'Team Leader',
    assignedToAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    status: 'Blocked',
    lastActivity: 'May 16, 2025 02:10 PM',
    establishedYear: 2021,
    employees: '8 - 12',
    annualRevenue: '₹ 20 Lakhs - ₹ 40 Lakhs',
    gstin: '27BCDEF1234G1Z3',
    website: 'https://glowsalon.in',
    totalLeads: 32,
    activeLeads: 8,
    convertedLeads: 10,
    wonLeads: 5,
    lostLeads: 12,
    followUpLeads: 3,
    serviceAreas: ['Bandra', 'Khar'],
    languages: ['English', 'Hindi'],
    businessHours: '10:00 AM - 09:00 PM',
    description: 'Luxury salon offering hair styling, skincare, and bridal wellness packages.',
  },
];

export const mockBusinessContacts: BusinessContactItem[] = [
  {
    id: 'CON-001',
    businessId: 'BUS-10058242',
    name: 'Amit Verma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    role: 'Owner',
    roleBadgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    phone: '+91 98765 43210',
    email: 'amit@fitzone.com',
    status: 'Active',
    addedOn: 'May 18, 2025 10:30 AM',
    addedByName: 'Vikram Patil',
    addedByRole: 'Sales Manager',
  },
  {
    id: 'CON-002',
    businessId: 'BUS-10058242',
    name: 'Neha Gupta',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    role: 'Manager',
    roleBadgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    phone: '+91 98234 56789',
    email: 'neha@fitzone.com',
    status: 'Active',
    addedOn: 'May 18, 2025 09:45 AM',
    addedByName: 'Neha Gupta',
    addedByRole: 'Team Leader',
  },
  {
    id: 'CON-003',
    businessId: 'BUS-10058242',
    name: 'Ravi Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    role: 'Operations Head',
    roleBadgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    phone: '+91 97654 32101',
    email: 'ravi@fitzone.com',
    status: 'Active',
    addedOn: 'May 17, 2025 06:20 PM',
    addedByName: 'Ankush Yadav',
    addedByRole: 'Sr. Executive',
  },
  {
    id: 'CON-004',
    businessId: 'BUS-10058242',
    name: 'Pooja Jadhav',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    role: 'Customer Support',
    roleBadgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    phone: '+91 98989 98899',
    email: 'pooja@fitzone.com',
    status: 'Active',
    addedOn: 'May 17, 2025 11:15 AM',
    addedByName: 'Pooja Jadhav',
    addedByRole: 'Sr. Executive',
  },
  {
    id: 'CON-005',
    businessId: 'BUS-10058242',
    name: 'Karan Mehta',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    role: 'Sales Head',
    roleBadgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
    phone: '+91 98111 22333',
    email: 'karan@fitzone.com',
    status: 'Inactive',
    addedOn: 'May 16, 2025 04:30 PM',
    addedByName: 'Vikram Patil',
    addedByRole: 'Sales Manager',
  },
  {
    id: 'CON-006',
    businessId: 'BUS-10058242',
    name: 'Deepak Patel',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    role: 'Trainer',
    roleBadgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    phone: '+91 93211 44556',
    email: 'deepak@fitzone.com',
    status: 'Blocked',
    addedOn: 'May 16, 2025 02:10 PM',
    addedByName: 'Neha Gupta',
    addedByRole: 'Team Leader',
  },
  {
    id: 'CON-007',
    businessId: 'BUS-10058242',
    name: 'Sanjay More',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    role: 'Accountant',
    roleBadgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    phone: '+91 90000 11222',
    email: 'sanjay@fitzone.com',
    status: 'Active',
    addedOn: 'May 15, 2025 05:05 PM',
    addedByName: 'Ankush Yadav',
    addedByRole: 'Sr. Executive',
  },
];

export const mockGoogleProfile: GoogleProfileData = {
  profileId: '12345678901234567890',
  status: 'Live on Google',
  verified: true,
  rating: 4.6,
  reviewCount: 128,
  address: 'Shop No. 12, 1st Floor, Orion Mall, Dr. C. H. Street, Mumbai, Maharashtra 400001',
  phone: '+91 98765 43210',
  website: 'https://fitzonegym.com',
  category: 'Gym / Fitness Center',
  createdOn: 'May 15, 2024',
  lastUpdated: 'May 17, 2025 10:30 AM',
  connectedOn: 'May 15, 2024',
  connectedBy: 'Vikram Patil',
  completenessPct: 92,
  insights: {
    views: 8456,
    searches: 4213,
    mapViews: 2125,
    websiteClicks: 312,
    calls: 186,
    directionRequests: 98,
  },
  reviews: [
    {
      id: 'REV-1',
      author: 'Rahul Mehta',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: 5,
      timeAgo: '2 days ago',
      comment: 'Great equipment and professional trainers. Highly recommended!',
    },
    {
      id: 'REV-2',
      author: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      rating: 5,
      timeAgo: '5 days ago',
      comment: 'Good environment and clean facilities. Happy with the service.',
    },
    {
      id: 'REV-3',
      author: 'Siddharth Joshi',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      rating: 4,
      timeAgo: '1 week ago',
      comment: 'Best gym in the area. Trainers are very supportive.',
    },
  ],
  posts: [
    {
      id: 'POST-1',
      title: 'Summer Offer - 50% OFF on Annual Membership!',
      date: 'May 16, 2025',
      views: 1256,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'POST-2',
      title: 'New Yoga Classes Starting This Week',
      date: 'May 12, 2025',
      views: 856,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'POST-3',
      title: 'Leg Day Challenge – Are You In?',
      date: 'May 8, 2025',
      views: 1102,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    },
  ],
};

export const mockSalesOrders: SalesOrderItem[] = [
  { id: '1', invoiceId: 'INV-2025-0068', orderDate: 'May 17, 2025 10:30 AM', orderType: 'Service', itemsCount: 3, amount: 42372, discount: 2372, tax: 7625, total: 47625, paymentStatus: 'Paid', status: 'Completed' },
  { id: '2', invoiceId: 'INV-2025-0067', orderDate: 'May 15, 2025 06:15 PM', orderType: 'Membership', itemsCount: 1, amount: 11864, discount: 864, tax: 2136, total: 13000, paymentStatus: 'Paid', status: 'Completed' },
  { id: '3', invoiceId: 'INV-2025-0066', orderDate: 'May 12, 2025 04:20 PM', orderType: 'Product', itemsCount: 2, amount: 5508, discount: 0, tax: 992, total: 6500, paymentStatus: 'Paid', status: 'Completed' },
  { id: '4', invoiceId: 'INV-2025-0065', orderDate: 'May 10, 2025 11:05 AM', orderType: 'Service', itemsCount: 2, amount: 8475, discount: 475, tax: 1525, total: 9525, paymentStatus: 'Partially Paid', status: 'Completed' },
  { id: '5', invoiceId: 'INV-2025-0064', orderDate: 'May 8, 2025 05:40 PM', orderType: 'Membership', itemsCount: 1, amount: 17797, discount: 1797, tax: 3203, total: 19000, paymentStatus: 'Paid', status: 'Completed' },
  { id: '6', invoiceId: 'INV-2025-0063', orderDate: 'May 5, 2025 03:10 PM', orderType: 'Service', itemsCount: 4, amount: 12712, discount: 712, tax: 2288, total: 15000, paymentStatus: 'Paid', status: 'Completed' },
  { id: '7', invoiceId: 'INV-2025-0062', orderDate: 'May 3, 2025 01:25 PM', orderType: 'Product', itemsCount: 1, amount: 3390, discount: 0, tax: 610, total: 4000, paymentStatus: 'Pending', status: 'Pending' },
  { id: '8', invoiceId: 'INV-2025-0061', orderDate: 'May 1, 2025 09:45 AM', orderType: 'Membership', itemsCount: 1, amount: 11864, discount: 864, tax: 2136, total: 13000, paymentStatus: 'Paid', status: 'Completed' },
];

export const mockBusinessVisits: BusinessVisitItem[] = [
  { id: '1', visitCode: 'VIS-2025-1042', date: 'May 24, 2025 11:30 AM', executiveName: 'Amit Verma', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', visitType: 'Sales Visit', purpose: 'Product Demo', status: 'Completed', duration: '45m', notes: 'Showed new packages. Client interested.' },
  { id: '2', visitCode: 'VIS-2025-1041', date: 'May 22, 2025 04:15 PM', executiveName: 'Neha Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', visitType: 'Follow-up', purpose: 'Requirement Discussion', status: 'In Progress', duration: '30m', notes: 'Discussed membership options.' },
  { id: '3', visitCode: 'VIS-2025-1040', date: 'May 20, 2025 10:00 AM', executiveName: 'Vikram Patil', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', visitType: 'Collection', purpose: 'Payment Collection', status: 'Completed', duration: '20m', notes: 'Collected payment of ₹ 12,000.' },
  { id: '4', visitCode: 'VIS-2025-1039', date: 'May 18, 2025 01:00 PM', executiveName: 'Pooja Yadav', executiveAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', visitType: 'Sales Visit', purpose: 'New Product Pitch', status: 'No Show', duration: '-', notes: 'N/A' },
  { id: '5', visitCode: 'VIS-2025-1038', date: 'May 16, 2025 12:30 PM', executiveName: 'Amit Verma', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', visitType: 'Follow-up', purpose: 'Follow-up Meeting', status: 'Completed', duration: '35m', notes: 'Client will decide next week.' },
  { id: '6', visitCode: 'VIS-2025-1037', date: 'May 15, 2025 11:15 AM', executiveName: 'Neha Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', visitType: 'Collection', purpose: 'Payment Collection', status: 'Cancelled', duration: '-', notes: 'Visit cancelled by client.' },
  { id: '7', visitCode: 'VIS-2025-1036', date: 'May 14, 2025 05:00 PM', executiveName: 'Vikram Patil', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', visitType: 'Sales Visit', purpose: 'Product Demo', status: 'Completed', duration: '40m', notes: 'Demo completed successfully.' },
];

export const mockSubscription: SubscriptionData = {
  subscriptionId: 'SUB-2025-00078',
  planName: 'Professional Plan',
  planBadge: 'Current Plan',
  billingCycle: 'Monthly',
  status: 'Active',
  startDate: 'May 20, 2025',
  endDate: 'June 20, 2025',
  nextBillingDate: 'May 20, 2025',
  amountExclTax: 11000,
  amountInclTax: 12980,
  autoRenewal: true,
  usage: {
    aiPostCredits: { used: 320, total: 1000 },
    reviewReplies: { used: 45, total: 200 },
    teamMembers: { used: 8, total: 20 },
  },
  features: [
    'Google Business Profile Management',
    'Review Management & Auto Reply',
    'Social Media Auto Post',
    'AI Website Builder',
  ],
  history: [
    {
      subscriptionId: 'SUB-2025-00078',
      planName: 'Professional Plan',
      billingCycle: 'Monthly',
      amountInclTax: 12980,
      status: 'Active',
      startDate: 'May 20, 2025',
      endDate: 'June 20, 2025 (Auto-renewal)',
      paymentMethod: 'VISA •••• 4242',
    },
    {
      subscriptionId: 'SUB-2025-00045',
      planName: 'Starter Plan',
      billingCycle: 'Monthly',
      amountInclTax: 5901,
      status: 'Cancelled',
      startDate: 'May 15, 2024',
      endDate: 'May 20, 2025',
      paymentMethod: 'VISA •••• 4242',
    },
  ],
};
