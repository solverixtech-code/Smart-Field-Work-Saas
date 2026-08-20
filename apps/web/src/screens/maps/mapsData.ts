export interface ExecutiveLocation {
  id: string;
  name: string;
  avatar: string;
  status: 'On Field' | 'In Transit' | 'Break' | 'Offline' | 'Vehicle';
  currentLocation: string;
  lastUpdated: string;
  batteryLevel: number;
  lat: number;
  lng: number;
  phone: string;
  team: string;
  visitsTodayCompleted: number;
  visitsTodayTotal: number;
  distanceKmToday: number;
  speedKmh?: number;
}

export interface BusinessProspectMarker {
  id: string;
  name: string;
  category: string;
  address: string;
  status: 'New Prospect' | 'Visited' | 'Follow-up' | 'Not Interested' | 'Demo Done' | 'Customer';
  markerColor: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'star';
  contactPerson: string;
  phone: string;
  lastVisitTime: string;
  lat: number;
  lng: number;
  region: string;
}

export interface HeatmapPoint {
  id: string;
  areaName: string;
  lat: number;
  lng: number;
  intensity: number; // 0 to 1 scale
  countOrValueText: string;
}

export interface TerritoryPolygon {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  executivesCount: number;
  targetAmount: string;
  achievedAmount: string;
  achievementPercentage: number;
  fillColor: string;
  borderColor: string;
  pathPoints: [number, number][]; // array of [lat, lng]
}

export interface RouteStop {
  id: string;
  stopNumber: number;
  type: 'start' | 'visit' | 'end' | 'waypoint';
  title: string;
  locationName: string;
  address: string;
  timestamp: string;
  durationSpentMinutes?: number;
  distanceKm: number;
  lat: number;
  lng: number;
  statusText?: string;
}

export interface ExecutiveRoute {
  executiveId: string;
  executiveName: string;
  executiveAvatar: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  totalDurationText: string;
  totalDistanceKm: number;
  totalVisitsPlanned: number;
  totalVisitsCompleted: number;
  avgSpeedKmh: number;
  stops: RouteStop[];
}

// ─── MOCK EXECUTIVE LOCATIONS (28 Executives across Mumbai) ─────────────────
export const mockExecutiveLocations: ExecutiveLocation[] = [
  {
    id: 'FE-1001',
    name: 'Amit Verma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    status: 'On Field',
    currentLocation: 'FitZone Gym, Andheri East',
    lastUpdated: '10:25 AM',
    batteryLevel: 79,
    lat: 19.1136,
    lng: 72.8697,
    phone: '+91 98765 43210',
    team: 'Mumbai Central',
    visitsTodayCompleted: 6,
    visitsTodayTotal: 8,
    distanceKmToday: 18.4,
    speedKmh: 0,
  },
  {
    id: 'FE-1002',
    name: 'Neha Gupta',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    status: 'On Field',
    currentLocation: 'Sharma Medical Store, Dadar West',
    lastUpdated: '10:24 AM',
    batteryLevel: 85,
    lat: 19.0178,
    lng: 72.8478,
    phone: '+91 98765 43211',
    team: 'South Mumbai',
    visitsTodayCompleted: 4,
    visitsTodayTotal: 6,
    distanceKmToday: 12.1,
    speedKmh: 0,
  },
  {
    id: 'FE-1003',
    name: 'Sanjay More',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    status: 'In Transit',
    currentLocation: 'Travelling on Western Express Hwy',
    lastUpdated: '10:22 AM',
    batteryLevel: 71,
    lat: 19.076,
    lng: 72.8777,
    phone: '+91 98765 43212',
    team: 'Western Suburbs',
    visitsTodayCompleted: 5,
    visitsTodayTotal: 9,
    distanceKmToday: 24.6,
    speedKmh: 34,
  },
  {
    id: 'FE-1004',
    name: 'Vikram Patil',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    status: 'On Field',
    currentLocation: 'Om Electronics, Thane West',
    lastUpdated: '10:21 AM',
    batteryLevel: 90,
    lat: 19.2183,
    lng: 72.9781,
    phone: '+91 98765 43213',
    team: 'Thane Region',
    visitsTodayCompleted: 7,
    visitsTodayTotal: 10,
    distanceKmToday: 31.2,
    speedKmh: 0,
  },
  {
    id: 'FE-1005',
    name: 'Pooja Yadav',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    status: 'Break',
    currentLocation: 'Near Borivali West Station',
    lastUpdated: '10:20 AM',
    batteryLevel: 45,
    lat: 19.2307,
    lng: 72.8567,
    phone: '+91 98765 43214',
    team: 'North Mumbai',
    visitsTodayCompleted: 3,
    visitsTodayTotal: 7,
    distanceKmToday: 14.5,
    speedKmh: 0,
  },
  {
    id: 'FE-1006',
    name: 'Ankush Yadav',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    status: 'On Field',
    currentLocation: 'Bright School, Borivali East',
    lastUpdated: '10:19 AM',
    batteryLevel: 66,
    lat: 19.2288,
    lng: 72.8624,
    phone: '+91 98765 43215',
    team: 'North Mumbai',
    visitsTodayCompleted: 5,
    visitsTodayTotal: 8,
    distanceKmToday: 16.8,
    speedKmh: 0,
  },
  {
    id: 'FE-1007',
    name: 'Neha More',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'Offline',
    currentLocation: 'Last seen: Bandra Kurla Complex',
    lastUpdated: '09:45 AM',
    batteryLevel: 12,
    lat: 19.0657,
    lng: 72.8686,
    phone: '+91 98765 43216',
    team: 'BKC Corporate',
    visitsTodayCompleted: 2,
    visitsTodayTotal: 6,
    distanceKmToday: 8.2,
    speedKmh: 0,
  },
  {
    id: 'FE-1008',
    name: 'Rohit Singh',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    status: 'Offline',
    currentLocation: 'Last seen: Vikhroli West',
    lastUpdated: '08:30 AM',
    batteryLevel: 0,
    lat: 19.1064,
    lng: 72.926,
    phone: '+91 98765 43217',
    team: 'Eastern Suburbs',
    visitsTodayCompleted: 0,
    visitsTodayTotal: 5,
    distanceKmToday: 0,
    speedKmh: 0,
  },
];

// ─── MOCK BUSINESS PROSPECT MARKERS ──────────────────────────────────────────
export const mockProspectMarkers: BusinessProspectMarker[] = [
  {
    id: 'BUS-9001',
    name: 'FitZone Gym',
    category: 'Gym & Fitness',
    address: 'Andheri East, Mumbai',
    status: 'Customer',
    markerColor: 'star',
    contactPerson: 'Amit Shah',
    phone: '+91 98200 11223',
    lastVisitTime: '10:25 AM Today',
    lat: 19.1136,
    lng: 72.8697,
    region: 'Andheri East',
  },
  {
    id: 'BUS-9002',
    name: 'Sharma Medical Store',
    category: 'Pharmacy',
    address: 'Dadar West, Mumbai',
    status: 'Visited',
    markerColor: 'green',
    contactPerson: 'Ramesh Sharma',
    phone: '+91 98200 44556',
    lastVisitTime: '10:24 AM Today',
    lat: 19.0178,
    lng: 72.8478,
    region: 'South Mumbai',
  },
  {
    id: 'BUS-9003',
    name: 'Om Electronics',
    category: 'Electronics',
    address: 'Thane West, Thane',
    status: 'Follow-up',
    markerColor: 'yellow',
    contactPerson: 'Karan Patil',
    phone: '+91 98200 77889',
    lastVisitTime: '10:21 AM Today',
    lat: 19.2183,
    lng: 72.9781,
    region: 'Thane',
  },
  {
    id: 'BUS-9004',
    name: 'Bright School',
    category: 'Education',
    address: 'Borivali East, Mumbai',
    status: 'Demo Done',
    markerColor: 'purple',
    contactPerson: 'Dr. Deshmukh',
    phone: '+91 98200 99001',
    lastVisitTime: '10:19 AM Today',
    lat: 19.2288,
    lng: 72.8624,
    region: 'North Mumbai',
  },
  {
    id: 'BUS-9005',
    name: 'Raj Super Market',
    category: 'Retail Grocery',
    address: 'Vile Parle West, Mumbai',
    status: 'New Prospect',
    markerColor: 'blue',
    contactPerson: 'Rajesh Gupta',
    phone: '+91 98200 33445',
    lastVisitTime: 'Unvisited',
    lat: 19.1005,
    lng: 72.8398,
    region: 'Western Suburbs',
  },
  {
    id: 'BUS-9006',
    name: 'Green Mart',
    category: 'Grocery',
    address: 'Kalyan West',
    status: 'New Prospect',
    markerColor: 'blue',
    contactPerson: 'Suresh Kumar',
    phone: '+91 98200 55667',
    lastVisitTime: '10:16 AM Today',
    lat: 19.2437,
    lng: 73.1355,
    region: 'Thane',
  },
  {
    id: 'BUS-9007',
    name: 'Dr. Patil Clinic',
    category: 'Healthcare',
    address: 'Mulund West, Mumbai',
    status: 'Visited',
    markerColor: 'green',
    contactPerson: 'Dr. S. Patil',
    phone: '+91 98200 88990',
    lastVisitTime: 'Yesterday',
    lat: 19.1726,
    lng: 72.9565,
    region: 'Eastern Suburbs',
  },
  {
    id: 'BUS-9008',
    name: 'Royal Bakers',
    category: 'Food & Beverages',
    address: 'Nerul, Navi Mumbai',
    status: 'Not Interested',
    markerColor: 'red',
    contactPerson: 'Zaid Khan',
    phone: '+91 98200 12345',
    lastVisitTime: 'Yesterday',
    lat: 19.033,
    lng: 73.018,
    region: 'Navi Mumbai',
  },
];

// ─── MOCK VISIT HEATMAP DATA ─────────────────────────────────────────────────
export const mockVisitHeatmapPoints: HeatmapPoint[] = [
  { id: 'hm-1', areaName: 'Andheri East', lat: 19.1136, lng: 72.8697, intensity: 0.95, countOrValueText: '857 visits' },
  { id: 'hm-2', areaName: 'Malad West', lat: 19.1874, lng: 72.8484, intensity: 0.8, countOrValueText: '642 visits' },
  { id: 'hm-3', areaName: 'Powai', lat: 19.1176, lng: 72.906, intensity: 0.72, countOrValueText: '532 visits' },
  { id: 'hm-4', areaName: 'Vikhroli West', lat: 19.1064, lng: 72.926, intensity: 0.65, countOrValueText: '418 visits' },
  { id: 'hm-5', areaName: 'Goregaon East', lat: 19.1663, lng: 72.8526, intensity: 0.58, countOrValueText: '376 visits' },
  { id: 'hm-6', areaName: 'Borivali West', lat: 19.2307, lng: 72.8567, intensity: 0.45, countOrValueText: '290 visits' },
  { id: 'hm-7', areaName: 'Bandra Kurla Complex', lat: 19.0657, lng: 72.8686, intensity: 0.75, countOrValueText: '580 visits' },
  { id: 'hm-8', areaName: 'Kandivali West', lat: 19.2067, lng: 72.8398, intensity: 0.5, countOrValueText: '320 visits' },
];

// ─── MOCK SALES HEATMAP DATA ──────────────────────────────────────────────────
export const mockSalesHeatmapPoints: HeatmapPoint[] = [
  { id: 'shm-1', areaName: 'Andheri East', lat: 19.1136, lng: 72.8697, intensity: 0.98, countOrValueText: '₹ 9,85,400' },
  { id: 'shm-2', areaName: 'Bandra Kurla Complex', lat: 19.0657, lng: 72.8686, intensity: 0.88, countOrValueText: '₹ 6,25,300' },
  { id: 'shm-3', areaName: 'Powai', lat: 19.1176, lng: 72.906, intensity: 0.75, countOrValueText: '₹ 4,85,200' },
  { id: 'shm-4', areaName: 'Ghatkopar West', lat: 19.086, lng: 72.9081, intensity: 0.62, countOrValueText: '₹ 3,65,800' },
  { id: 'shm-5', areaName: 'Malad West', lat: 19.1874, lng: 72.8484, intensity: 0.55, countOrValueText: '₹ 3,15,600' },
  { id: 'shm-6', areaName: 'Thane West', lat: 19.2183, lng: 72.9781, intensity: 0.7, countOrValueText: '₹ 4,10,000' },
];

// ─── MOCK TERRITORY POLYGONS ─────────────────────────────────────────────────
export const mockTerritoryPolygons: TerritoryPolygon[] = [
  {
    id: 'TERR-01',
    name: 'Andheri West',
    centerLat: 19.135,
    centerLng: 72.835,
    executivesCount: 12,
    targetAmount: '₹ 12,00,000',
    achievedAmount: '72%',
    achievementPercentage: 72,
    fillColor: '#8B5CF6',
    borderColor: '#7C3AED',
    pathPoints: [
      [19.16, 72.82],
      [19.16, 72.85],
      [19.11, 72.85],
      [19.11, 72.82],
    ],
  },
  {
    id: 'TERR-02',
    name: 'Andheri East',
    centerLat: 19.135,
    centerLng: 72.875,
    executivesCount: 14,
    targetAmount: '₹ 14,00,000',
    achievedAmount: '68%',
    achievementPercentage: 68,
    fillColor: '#10B981',
    borderColor: '#059669',
    pathPoints: [
      [19.16, 72.85],
      [19.16, 72.9],
      [19.11, 72.9],
      [19.11, 72.85],
    ],
  },
  {
    id: 'TERR-03',
    name: 'Malad',
    centerLat: 19.185,
    centerLng: 72.845,
    executivesCount: 11,
    targetAmount: '₹ 11,00,000',
    achievedAmount: '70%',
    achievementPercentage: 70,
    fillColor: '#EF4444',
    borderColor: '#DC2626',
    pathPoints: [
      [19.21, 72.82],
      [19.21, 72.87],
      [19.16, 72.87],
      [19.16, 72.82],
    ],
  },
  {
    id: 'TERR-04',
    name: 'Powai',
    centerLat: 19.12,
    centerLng: 72.91,
    executivesCount: 9,
    targetAmount: '₹ 8,50,000',
    achievedAmount: '60%',
    achievementPercentage: 60,
    fillColor: '#F59E0B',
    borderColor: '#D97706',
    pathPoints: [
      [19.14, 72.89],
      [19.14, 72.93],
      [19.1, 72.93],
      [19.1, 72.89],
    ],
  },
  {
    id: 'TERR-05',
    name: 'Thane',
    centerLat: 19.21,
    centerLng: 72.97,
    executivesCount: 10,
    targetAmount: '₹ 10,00,000',
    achievedAmount: '65%',
    achievementPercentage: 65,
    fillColor: '#F97316',
    borderColor: '#EA580C',
    pathPoints: [
      [19.24, 72.94],
      [19.24, 73.0],
      [19.18, 73.0],
      [19.18, 72.94],
    ],
  },
  {
    id: 'TERR-06',
    name: 'Vikhroli',
    centerLat: 19.11,
    centerLng: 72.94,
    executivesCount: 8,
    targetAmount: '₹ 7,50,000',
    achievedAmount: '58%',
    achievementPercentage: 58,
    fillColor: '#3B82F6',
    borderColor: '#2563EB',
    pathPoints: [
      [19.14, 72.93],
      [19.14, 72.97],
      [19.08, 72.97],
      [19.08, 72.93],
    ],
  },
  {
    id: 'TERR-07',
    name: 'Bandra',
    centerLat: 19.06,
    centerLng: 72.84,
    executivesCount: 13,
    targetAmount: '₹ 13,50,000',
    achievedAmount: '74%',
    achievementPercentage: 74,
    fillColor: '#06B6D4',
    borderColor: '#0891B2',
    pathPoints: [
      [19.09, 72.81],
      [19.09, 72.87],
      [19.03, 72.87],
      [19.03, 72.81],
    ],
  },
  {
    id: 'TERR-08',
    name: 'Ghatkopar',
    centerLat: 19.08,
    centerLng: 72.9,
    executivesCount: 12,
    targetAmount: '₹ 11,00,000',
    achievedAmount: '77%',
    achievementPercentage: 77,
    fillColor: '#6366F1',
    borderColor: '#4F46E5',
    pathPoints: [
      [19.11, 72.88],
      [19.11, 72.93],
      [19.05, 72.93],
      [19.05, 72.88],
    ],
  },
];

// ─── MOCK ROUTE PLAYBACK DATA FOR ARJUN MEHTA (12 STOPS) ───────────────────
export const mockArjunMehtaRoute: ExecutiveRoute = {
  executiveId: 'FE-1009',
  executiveName: 'Arjun Mehta',
  executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  status: 'On Field',
  date: 'May 24, 2025',
  startTime: '09:02 AM',
  endTime: '06:47 PM',
  totalDurationText: '9h 45m',
  totalDistanceKm: 28.6,
  totalVisitsPlanned: 12,
  totalVisitsCompleted: 12,
  avgSpeedKmh: 18.2,
  stops: [
    {
      id: 'stop-1',
      stopNumber: 1,
      type: 'start',
      title: 'Start Location',
      locationName: 'Home Location',
      address: 'Andheri West, Mumbai 400053',
      timestamp: '09:02 AM',
      distanceKm: 0,
      lat: 19.135,
      lng: 72.828,
    },
    {
      id: 'stop-2',
      stopNumber: 2,
      type: 'visit',
      title: 'Visit #1',
      locationName: 'Sharma Medical Store',
      address: 'Andheri West, Mumbai',
      timestamp: '09:18 AM',
      durationSpentMinutes: 22,
      distanceKm: 2.1,
      lat: 19.138,
      lng: 72.836,
      statusText: 'Check-in Success',
    },
    {
      id: 'stop-3',
      stopNumber: 3,
      type: 'visit',
      title: 'Visit #2',
      locationName: 'Patel Electronics',
      address: 'Andheri West, Mumbai',
      timestamp: '10:05 AM',
      durationSpentMinutes: 18,
      distanceKm: 4.5,
      lat: 19.132,
      lng: 72.842,
      statusText: 'Requirement Collected',
    },
    {
      id: 'stop-4',
      stopNumber: 4,
      type: 'visit',
      title: 'Visit #3',
      locationName: 'Royal Bakers',
      address: 'Versova, Mumbai',
      timestamp: '10:48 AM',
      durationSpentMinutes: 25,
      distanceKm: 6.8,
      lat: 19.128,
      lng: 72.849,
      statusText: 'Demo Completed',
    },
    {
      id: 'stop-5',
      stopNumber: 5,
      type: 'visit',
      title: 'Visit #4',
      locationName: 'Om Enterprises',
      address: 'Goregaon East, Mumbai',
      timestamp: '11:42 AM',
      durationSpentMinutes: 20,
      distanceKm: 9.4,
      lat: 19.123,
      lng: 72.858,
      statusText: 'Proposal Delivered',
    },
    {
      id: 'stop-6',
      stopNumber: 6,
      type: 'visit',
      title: 'Visit #5',
      locationName: 'Bright Coaching Institute',
      address: 'Jogeshwari West, Mumbai',
      timestamp: '12:30 PM',
      durationSpentMinutes: 30,
      distanceKm: 12.1,
      lat: 19.117,
      lng: 72.865,
      statusText: 'Follow-up Scheduled',
    },
    {
      id: 'stop-7',
      stopNumber: 7,
      type: 'visit',
      title: 'Visit #6',
      locationName: 'Sagar Supermarket',
      address: 'Powai, Mumbai',
      timestamp: '01:45 PM',
      durationSpentMinutes: 24,
      distanceKm: 15.6,
      lat: 19.121,
      lng: 72.879,
      statusText: 'Payment Collected',
    },
    {
      id: 'stop-8',
      stopNumber: 8,
      type: 'visit',
      title: 'Visit #7',
      locationName: 'Krystal Tech Systems',
      address: 'Vikhroli West, Mumbai',
      timestamp: '02:50 PM',
      durationSpentMinutes: 28,
      distanceKm: 18.9,
      lat: 19.112,
      lng: 72.891,
      statusText: 'Contract Signed',
    },
    {
      id: 'stop-9',
      stopNumber: 9,
      type: 'visit',
      title: 'Visit #8',
      locationName: 'Apollo Pharmacy Branch',
      address: 'Ghatkopar West, Mumbai',
      timestamp: '03:40 PM',
      durationSpentMinutes: 15,
      distanceKm: 21.3,
      lat: 19.098,
      lng: 72.885,
      statusText: 'Order Placed',
    },
    {
      id: 'stop-10',
      stopNumber: 10,
      type: 'visit',
      title: 'Visit #9',
      locationName: 'Zenith Fitness Studio',
      address: 'BKC, Mumbai',
      timestamp: '04:35 PM',
      durationSpentMinutes: 35,
      distanceKm: 24.1,
      lat: 19.082,
      lng: 72.872,
      statusText: 'Meeting Won',
    },
    {
      id: 'stop-11',
      stopNumber: 11,
      type: 'visit',
      title: 'Visit #10',
      locationName: 'Metro Hardware Stores',
      address: 'Kurla West, Mumbai',
      timestamp: '05:30 PM',
      durationSpentMinutes: 22,
      distanceKm: 26.5,
      lat: 19.071,
      lng: 72.868,
      statusText: 'Catalog Delivered',
    },
    {
      id: 'stop-12',
      stopNumber: 12,
      type: 'end',
      title: 'End Location',
      locationName: 'Regional Office',
      address: 'BKC Complex, Mumbai 400051',
      timestamp: '06:47 PM',
      distanceKm: 28.6,
      lat: 19.065,
      lng: 72.862,
    },
  ],
};
