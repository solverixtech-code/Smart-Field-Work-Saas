export interface VisitItem {
  id: string; // e.g. VIS-2025-1042
  businessId: string;
  businessName: string;
  businessType: string;
  businessCategory: string;
  location: string;
  executiveId: string;
  executiveName: string;
  executiveRole: string;
  executiveAvatar: string;
  executivePhone: string;
  executiveEmail: string;
  visitType: 'Sales Visit' | 'Follow-up' | 'Collection' | 'Requirement Discussion' | 'Product Demo' | 'Onboarding';
  purpose: string;
  scheduledDateTime: string; // e.g. May 24, 2025, 10:00 AM
  actualDateTime?: string; // e.g. May 24, 2025, 10:05 AM - 10:50 AM
  duration?: string; // e.g. 45m
  status: 'Completed' | 'Scheduled' | 'In Progress' | 'Missed' | 'Cancelled';
  checkInTime?: string; // 10:05 AM
  checkOutTime?: string; // 10:50 AM
  checkInPhoto?: string;
  checkOutPhoto?: string;
  isGpsVerified: boolean;
  gpsStatus: 'Verified (Within 100m)' | 'Outside Radius (350m)' | 'No Signal Area' | 'Manual Override';
  distanceFromShop?: string; // 15m or 350m
  routeArea: string; // e.g. Andheri East Route
  travelMode: string; // Bike / Car / Public Transport
  distanceTraveled: string; // 8.6 km
  outcome: 'Positive' | 'Neutral' | 'Lost' | 'Pending';
  nextStep: string;
  followUpDate?: string;
  priority: 'High' | 'Medium' | 'Low';
  remarks: string;
  notes: string;
  expectedValue?: string;
  createdBy: string;
  createdOn: string;
  productsDiscussed: {
    name: string;
    discussion: string;
    interest: 'High' | 'Medium' | 'Low';
    expectedValue: string;
    nextStep: string;
  }[];
  tasksCreated: {
    title: string;
    dueDate: string;
    status: 'Pending' | 'Completed';
  }[];
  documentsShared: {
    name: string;
    size: string;
    url: string;
  }[];
}

export interface GpsExceptionItem {
  id: string; // e.g. GEX-2025-0078
  visitId: string;
  executiveName: string;
  executiveRole: string;
  executiveAvatar: string;
  executivePhone: string;
  teamManager: string;
  businessName: string;
  businessAddress: string;
  expectedLatitude: number;
  expectedLongitude: number;
  actualLatitude: number;
  actualLongitude: number;
  exceptionType: 'Check-in Outside Radius' | 'Check-out Outside Radius' | 'No Signal Area' | 'Wrong Location Marked' | 'Late Check-out';
  reasonCategory: string;
  detailedReason: string;
  requestedAt: string;
  scheduledTime: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  allowedRadiusMeters: number;
  capturedDistanceMeters: number;
  proofAttachment?: string;
  notesByExecutive: string;
  managerNotes?: string;
}

export const mockVisits: VisitItem[] = [
  {
    id: 'VIS-2025-1042',
    businessId: 'BUS-1001',
    businessName: 'FitZone Gym',
    businessType: 'Gym / Fitness',
    businessCategory: 'Health & Fitness',
    location: 'Shop No. 12, 1st Floor, Orion Mall, Dr. C. H. Street, Mumbai, Maharashtra 400001',
    executiveId: 'FE-1001',
    executiveName: 'Amit Verma',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    executivePhone: '+91 98765 43210',
    executiveEmail: 'amit.verma@sfw.com',
    visitType: 'Sales Visit',
    purpose: 'Product Demo',
    scheduledDateTime: 'May 24, 2025, 10:00 AM',
    actualDateTime: 'May 24, 2025, 10:05 AM - 10:50 AM',
    duration: '45m',
    status: 'Completed',
    checkInTime: '10:05 AM',
    checkOutTime: '10:50 AM',
    checkInPhoto: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
    checkOutPhoto: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    isGpsVerified: true,
    gpsStatus: 'Verified (Within 100m)',
    distanceFromShop: '12m',
    routeArea: 'Andheri East Route',
    travelMode: 'Bike',
    distanceTraveled: '8.6 km',
    outcome: 'Positive',
    nextStep: 'Send Proposal',
    followUpDate: 'May 28, 2025',
    priority: 'Medium',
    remarks: 'Client showed high interest in premium membership plan. Proposal sent via email.',
    notes: 'Visited the gym. Discussed corporate tie-ups and premium membership plan. They are interested in offering special discounts for employees.',
    expectedValue: '₹3,70,000',
    createdBy: 'Rohit Sharma (Admin)',
    createdOn: 'May 23, 2025, 06:15 PM',
    productsDiscussed: [
      {
        name: 'Premium Membership Plan',
        discussion: 'Discussed yearly premium plan with benefits',
        interest: 'High',
        expectedValue: '₹1,20,000',
        nextStep: 'Send proposal',
      },
      {
        name: 'Corporate Tie-up',
        discussion: 'Discussed corporate discounts for 50+ employees',
        interest: 'Medium',
        expectedValue: '₹2,50,000',
        nextStep: 'Follow up with decision maker',
      },
      {
        name: 'Personal Training',
        discussion: 'Inquired about personal training packages',
        interest: 'Low',
        expectedValue: '₹30,000',
        nextStep: 'Share brochure',
      },
    ],
    tasksCreated: [
      {
        title: 'Send proposal for premium membership plan',
        dueDate: 'May 28, 2025',
        status: 'Pending',
      },
      {
        title: 'Follow up with decision maker',
        dueDate: 'Jun 02, 2025',
        status: 'Pending',
      },
    ],
    documentsShared: [
      {
        name: 'FitZone_Premium_Plan.pdf',
        size: '1.2 MB',
        url: '#',
      },
      {
        name: 'Corporate_Tie-up_Brochure.pdf',
        size: '2.4 MB',
        url: '#',
      },
    ],
  },
  {
    id: 'VIS-2025-1043',
    businessId: 'BUS-1002',
    businessName: 'Sharma Medical Store',
    businessType: 'Pharmacy',
    businessCategory: 'Healthcare',
    location: 'Dadar West Market, Mumbai, Maharashtra 400028',
    executiveId: 'FE-1002',
    executiveName: 'Neha Gupta',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    executivePhone: '+91 98765 43211',
    executiveEmail: 'neha.gupta@sfw.com',
    visitType: 'Follow-up',
    purpose: 'Requirement Discussion',
    scheduledDateTime: 'May 24, 2025, 12:00 PM',
    actualDateTime: 'May 24, 2025, 12:10 PM - 12:40 PM',
    duration: '30m',
    status: 'Completed',
    checkInTime: '12:10 PM',
    checkOutTime: '12:40 PM',
    checkInPhoto: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400',
    checkOutPhoto: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400',
    isGpsVerified: true,
    gpsStatus: 'Verified (Within 100m)',
    distanceFromShop: '8m',
    routeArea: 'Dadar West Route',
    travelMode: 'Scooter',
    distanceTraveled: '5.2 km',
    outcome: 'Positive',
    nextStep: 'Collect Payment',
    followUpDate: 'May 26, 2025',
    priority: 'High',
    remarks: 'Owner agreed to renew POS software subscription. Payment link shared.',
    notes: 'Met owner Mr. Sharma. Confirmed renewal of annual software subscription.',
    expectedValue: '₹45,000',
    createdBy: 'Rohit Sharma (Admin)',
    createdOn: 'May 23, 2025, 05:00 PM',
    productsDiscussed: [
      {
        name: 'Pharmacy POS Renewal',
        discussion: 'Annual software license renewal',
        interest: 'High',
        expectedValue: '₹45,000',
        nextStep: 'Collect payment',
      },
    ],
    tasksCreated: [
      {
        title: 'Collect payment for POS renewal',
        dueDate: 'May 26, 2025',
        status: 'Pending',
      },
    ],
    documentsShared: [
      {
        name: 'Invoice_Pharmacy_POS.pdf',
        size: '890 KB',
        url: '#',
      },
    ],
  },
  {
    id: 'VIS-2025-1044',
    businessId: 'BUS-1003',
    businessName: 'Om Electronics',
    businessType: 'Retail Supermarket',
    businessCategory: 'Electronics',
    location: 'Station Road, Thane West, Thane, Maharashtra 400601',
    executiveId: 'FE-1003',
    executiveName: 'Vikram Patil',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    executivePhone: '+91 98765 43212',
    executiveEmail: 'vikram.patil@sfw.com',
    visitType: 'Collection',
    purpose: 'Payment Collection',
    scheduledDateTime: 'May 24, 2025, 02:30 PM',
    actualDateTime: 'May 24, 2025, 02:40 PM - 03:15 PM',
    duration: '35m',
    status: 'Completed',
    checkInTime: '02:40 PM',
    checkOutTime: '03:15 PM',
    isGpsVerified: false,
    gpsStatus: 'Outside Radius (350m)',
    distanceFromShop: '350m',
    routeArea: 'Thane West Route',
    travelMode: 'Bike',
    distanceTraveled: '12.4 km',
    outcome: 'Neutral',
    nextStep: 'Re-visit for Cheque',
    followUpDate: 'May 27, 2025',
    priority: 'Medium',
    remarks: 'Cheque not signed today. Promised for Tuesday morning.',
    notes: 'Accounts manager was out of office. Store manager asked to come back on Tuesday.',
    expectedValue: '₹1,50,000',
    createdBy: 'Sanjay More (Manager)',
    createdOn: 'May 24, 2025, 09:00 AM',
    productsDiscussed: [],
    tasksCreated: [],
    documentsShared: [],
  },
  {
    id: 'VIS-2025-1045',
    businessId: 'BUS-1004',
    businessName: 'Raj Super Market',
    businessType: 'Super Market',
    businessCategory: 'Retail',
    location: 'Sector 17, Vashi, Navi Mumbai, Maharashtra 400703',
    executiveId: 'FE-1004',
    executiveName: 'Pooja Yadav',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    executivePhone: '+91 98765 43213',
    executiveEmail: 'pooja.yadav@sfw.com',
    visitType: 'Sales Visit',
    purpose: 'New Product Pitch',
    scheduledDateTime: 'May 25, 2025, 11:00 AM',
    status: 'Scheduled',
    isGpsVerified: true,
    gpsStatus: 'Verified (Within 100m)',
    routeArea: 'Vashi Route',
    travelMode: 'Scooter',
    distanceTraveled: '0 km',
    outcome: 'Pending',
    nextStep: 'Conduct Visit',
    priority: 'High',
    remarks: 'Scheduled pitch meeting for retail ERP module.',
    notes: 'Targeting 3 billing counters integration.',
    createdBy: 'Rohit Sharma (Admin)',
    createdOn: 'May 24, 2025, 11:30 AM',
    productsDiscussed: [],
    tasksCreated: [],
    documentsShared: [],
  },
  {
    id: 'VIS-2025-1046',
    businessId: 'BUS-1005',
    businessName: 'Bright School',
    businessType: 'Education',
    businessCategory: 'Schools & Institutes',
    location: 'Borivali East, Mumbai, Maharashtra 400066',
    executiveId: 'FE-1005',
    executiveName: 'Ankush Yadav',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    executivePhone: '+91 98765 43214',
    executiveEmail: 'ankush.yadav@sfw.com',
    visitType: 'Follow-up',
    purpose: 'Follow-up Meeting',
    scheduledDateTime: 'May 25, 2025, 03:00 PM',
    status: 'Scheduled',
    isGpsVerified: true,
    gpsStatus: 'Verified (Within 100m)',
    routeArea: 'Borivali Route',
    travelMode: 'Car',
    distanceTraveled: '0 km',
    outcome: 'Pending',
    nextStep: 'Conduct Meeting',
    priority: 'High',
    remarks: 'Meeting trustee for final approval.',
    notes: 'School ERP presentation to management.',
    createdBy: 'Ankush Yadav',
    createdOn: 'May 24, 2025, 04:00 PM',
    productsDiscussed: [],
    tasksCreated: [],
    documentsShared: [],
  },
  {
    id: 'VIS-2025-1047',
    businessId: 'BUS-1006',
    businessName: 'Hotel Residency',
    businessType: 'Hotel',
    businessCategory: 'Hospitality',
    location: 'Ghatkopar West, Mumbai, Maharashtra 400086',
    executiveId: 'FE-1006',
    executiveName: 'Sanjay More',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    executivePhone: '+91 98765 43215',
    executiveEmail: 'sanjay.more@sfw.com',
    visitType: 'Sales Visit',
    purpose: 'Product Demo',
    scheduledDateTime: 'May 23, 2025, 11:00 AM',
    status: 'Missed',
    isGpsVerified: false,
    gpsStatus: 'Outside Radius (350m)',
    routeArea: 'Ghatkopar Route',
    travelMode: 'Bike',
    distanceTraveled: '4.1 km',
    outcome: 'Lost',
    nextStep: 'Reschedule Visit',
    priority: 'Medium',
    remarks: 'Executive could not reach due to heavy traffic jam. Need to reschedule.',
    notes: 'Hotel manager waited 20 minutes, then rescheduled.',
    createdBy: 'Rohit Sharma (Admin)',
    createdOn: 'May 22, 2025, 10:00 AM',
    productsDiscussed: [],
    tasksCreated: [],
    documentsShared: [],
  },
];

export const mockGpsExceptions: GpsExceptionItem[] = [
  {
    id: 'GEX-2025-0078',
    visitId: 'VIS-2025-1044',
    executiveName: 'Amit Verma',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    executivePhone: '+91 98765 43210',
    teamManager: 'Rohit Sharma (North Mumbai)',
    businessName: 'FitZone Gym',
    businessAddress: 'Andheri East, Mumbai, Maharashtra 400069',
    expectedLatitude: 19.119698,
    expectedLongitude: 72.869701,
    actualLatitude: 19.12489,
    actualLongitude: 72.87521,
    exceptionType: 'Check-in Outside Radius',
    reasonCategory: 'Client Not at Recorded Address',
    detailedReason: 'Client shifted to new address recently. Visited the new location for meeting and demo.',
    requestedAt: 'Jun 7, 2025, 10:35 AM',
    scheduledTime: 'Jun 7, 2025, 10:00 AM',
    status: 'Pending Review',
    allowedRadiusMeters: 100,
    capturedDistanceMeters: 350,
    proofAttachment: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
    notesByExecutive: 'Client shifted to new address recently. Please approve the exception.',
    managerNotes: '',
  },
  {
    id: 'GEX-2025-0077',
    visitId: 'VIS-2025-1043',
    executiveName: 'Neha Gupta',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    executivePhone: '+91 98765 43211',
    teamManager: 'Ankush Yadav (West Mumbai)',
    businessName: 'Sharma Medical Store',
    businessAddress: 'Dadar West, Mumbai, Maharashtra 400028',
    expectedLatitude: 19.0178,
    expectedLongitude: 72.8478,
    actualLatitude: 19.021,
    actualLongitude: 72.851,
    exceptionType: 'Check-out Outside Radius',
    reasonCategory: 'Traffic issue / Parked Far Away',
    detailedReason: 'Traffic issue, had to leave early and check out from parking area.',
    requestedAt: 'Jun 7, 2025, 09:15 AM',
    scheduledTime: 'Jun 7, 2025, 08:45 AM',
    status: 'Pending Review',
    allowedRadiusMeters: 100,
    capturedDistanceMeters: 280,
    notesByExecutive: 'Checked out from parking lot 280m away.',
  },
  {
    id: 'GEX-2025-0076',
    visitId: 'VIS-2025-1044',
    executiveName: 'Vikram Patil',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    executivePhone: '+91 98765 43212',
    teamManager: 'Sanjay More (Thane Zone)',
    businessName: 'Om Electronics',
    businessAddress: 'Thane West, Thane, Maharashtra 400601',
    expectedLatitude: 19.2183,
    expectedLongitude: 72.9781,
    actualLatitude: 19.2185,
    actualLongitude: 72.9783,
    exceptionType: 'No Signal Area',
    reasonCategory: 'Basement / Building Deadzone',
    detailedReason: 'No network inside basement store area during visit.',
    requestedAt: 'Jun 7, 2025, 08:45 AM',
    scheduledTime: 'Jun 7, 2025, 08:30 AM',
    status: 'Approved',
    allowedRadiusMeters: 100,
    capturedDistanceMeters: 25,
    notesByExecutive: 'Approve basement offline check-in.',
    managerNotes: 'Approved based on basement location receipt.',
  },
  {
    id: 'GEX-2025-0075',
    visitId: 'VIS-2025-1045',
    executiveName: 'Pooja Yadav',
    executiveRole: 'Field Executive',
    executiveAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    executivePhone: '+91 98765 43213',
    teamManager: 'Neha Gupta (Navi Mumbai)',
    businessName: 'Raj Super Market',
    businessAddress: 'Vashi, Navi Mumbai, Maharashtra 400703',
    expectedLatitude: 19.077,
    expectedLongitude: 72.998,
    actualLatitude: 19.082,
    actualLongitude: 73.003,
    exceptionType: 'Wrong Location Marked',
    reasonCategory: 'Google Pin Mismatch',
    detailedReason: 'Marked wrong location on map by mistake.',
    requestedAt: 'Jun 6, 2025, 06:20 PM',
    scheduledTime: 'Jun 6, 2025, 05:30 PM',
    status: 'Pending Review',
    allowedRadiusMeters: 100,
    capturedDistanceMeters: 420,
    notesByExecutive: 'Corrected location request.',
  },
];
