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
  detailedRoadPath?: [number, number][];
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

// ─── MOCK VISIT HEATMAP DATA (25 Dense Clusters for Realistic GPU Heatmap Rendering) ───
export const mockVisitHeatmapPoints: HeatmapPoint[] = [
  // Andheri East / MIDC / Chakala High-Density Cluster
  { id: 'hm-1', areaName: 'Andheri East (MIDC)', lat: 19.1136, lng: 72.8697, intensity: 0.95, countOrValueText: '857 visits' },
  { id: 'hm-1a', areaName: 'Chakala Metro Station', lat: 19.1158, lng: 72.8621, intensity: 0.88, countOrValueText: '720 visits' },
  { id: 'hm-1b', areaName: 'Marol Naka', lat: 19.1121, lng: 72.8765, intensity: 0.92, countOrValueText: '810 visits' },
  { id: 'hm-1c', areaName: 'SEEPZ Gate 1', lat: 19.1245, lng: 72.8712, intensity: 0.85, countOrValueText: '690 visits' },
  { id: 'hm-1d', areaName: 'JB Nagar', lat: 19.1102, lng: 72.8643, intensity: 0.78, countOrValueText: '540 visits' },

  // Bandra Kurla Complex (BKC) High-Density Financial Cluster
  { id: 'hm-7', areaName: 'Bandra Kurla Complex', lat: 19.0657, lng: 72.8686, intensity: 0.91, countOrValueText: '790 visits' },
  { id: 'hm-7a', areaName: 'BKC G Block', lat: 19.0689, lng: 72.8645, intensity: 0.86, countOrValueText: '640 visits' },
  { id: 'hm-7b', areaName: 'Kalanagar Bandra East', lat: 19.0602, lng: 72.8521, intensity: 0.74, countOrValueText: '510 visits' },

  // Powai & Hiranandani Tech Cluster
  { id: 'hm-3', areaName: 'Powai Hiranandani', lat: 19.1176, lng: 72.906, intensity: 0.84, countOrValueText: '630 visits' },
  { id: 'hm-3a', areaName: 'IIT Bombay Gate', lat: 19.1242, lng: 72.9154, intensity: 0.72, countOrValueText: '490 visits' },
  { id: 'hm-3b', areaName: 'Saki Vihar Road', lat: 19.1098, lng: 72.8932, intensity: 0.68, countOrValueText: '420 visits' },

  // Lower Parel & Dadar South Mumbai Commercial Corridor
  { id: 'hm-9', areaName: 'Lower Parel (Phoenix)', lat: 18.9952, lng: 72.8288, intensity: 0.89, countOrValueText: '760 visits' },
  { id: 'hm-9a', areaName: 'Dadar West Market', lat: 19.0178, lng: 72.8478, intensity: 0.81, countOrValueText: '620 visits' },
  { id: 'hm-9b', areaName: 'Prabhadevi Commercial', lat: 19.0125, lng: 72.8265, intensity: 0.73, countOrValueText: '510 visits' },

  // Malad & Goregaon IT Hub
  { id: 'hm-2', areaName: 'Malad Mindspace', lat: 19.1874, lng: 72.8484, intensity: 0.83, countOrValueText: '642 visits' },
  { id: 'hm-5', areaName: 'Goregaon East (Nesco)', lat: 19.1663, lng: 72.8526, intensity: 0.76, countOrValueText: '576 visits' },
  { id: 'hm-2a', areaName: 'Inorbit Malad', lat: 19.1765, lng: 72.8398, intensity: 0.69, countOrValueText: '430 visits' },

  // Vikhroli & Ghatkopar LBS Corridor
  { id: 'hm-4', areaName: 'Vikhroli Godrej IT', lat: 19.1064, lng: 72.926, intensity: 0.79, countOrValueText: '580 visits' },
  { id: 'hm-4a', areaName: 'Ghatkopar West LBS', lat: 19.086, lng: 72.9081, intensity: 0.71, countOrValueText: '480 visits' },
  { id: 'hm-4b', areaName: 'Kanjurmarg East', lat: 19.1312, lng: 72.9345, intensity: 0.62, countOrValueText: '370 visits' },

  // Thane & Mulund Hub
  { id: 'hm-10', areaName: 'Thane Viviana Mall', lat: 19.2183, lng: 72.9781, intensity: 0.80, countOrValueText: '610 visits' },
  { id: 'hm-10a', areaName: 'Mulund West Check Naka', lat: 19.1726, lng: 72.9565, intensity: 0.66, countOrValueText: '410 visits' },

  // Borivali & Kandivali Corridor
  { id: 'hm-6', areaName: 'Borivali West Station', lat: 19.2307, lng: 72.8567, intensity: 0.65, countOrValueText: '390 visits' },
  { id: 'hm-8', areaName: 'Kandivali West Link Rd', lat: 19.2067, lng: 72.8398, intensity: 0.58, countOrValueText: '320 visits' },
];

// ─── MOCK SALES HEATMAP DATA ──────────────────────────────────────────────────
export const mockSalesHeatmapPoints: HeatmapPoint[] = [
  { id: 'shm-1', areaName: 'Andheri East (MIDC)', lat: 19.1136, lng: 72.8697, intensity: 0.98, countOrValueText: '₹ 9,85,400' },
  { id: 'shm-1a', areaName: 'Chakala Business Hub', lat: 19.1158, lng: 72.8621, intensity: 0.89, countOrValueText: '₹ 7,40,000' },
  { id: 'shm-2', areaName: 'Bandra Kurla Complex', lat: 19.0657, lng: 72.8686, intensity: 0.92, countOrValueText: '₹ 8,25,300' },
  { id: 'shm-2a', areaName: 'BKC G Block', lat: 19.0689, lng: 72.8645, intensity: 0.84, countOrValueText: '₹ 6,10,000' },
  { id: 'shm-3', areaName: 'Powai Hiranandani', lat: 19.1176, lng: 72.906, intensity: 0.79, countOrValueText: '₹ 5,85,200' },
  { id: 'shm-4', areaName: 'Ghatkopar West', lat: 19.086, lng: 72.9081, intensity: 0.72, countOrValueText: '₹ 4,65,800' },
  { id: 'shm-5', areaName: 'Malad West Mindspace', lat: 19.1874, lng: 72.8484, intensity: 0.68, countOrValueText: '₹ 4,15,600' },
  { id: 'shm-6', areaName: 'Thane West Viviana', lat: 19.2183, lng: 72.9781, intensity: 0.76, countOrValueText: '₹ 5,10,000' },
  { id: 'shm-7', areaName: 'Lower Parel Phoenix', lat: 18.9952, lng: 72.8288, intensity: 0.94, countOrValueText: '₹ 8,90,000' },
  { id: 'shm-8', areaName: 'Dadar West', lat: 19.0178, lng: 72.8478, intensity: 0.81, countOrValueText: '₹ 6,50,000' },
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
  detailedRoadPath: [
    // Stop 1: Andheri West Start (19.135, 72.828)
    [19.1350, 72.8280],
    [19.1354, 72.8292],
    [19.1360, 72.8305],
    [19.1366, 72.8320],
    [19.1372, 72.8338],
    [19.1377, 72.8352],
    // Stop 2: Sharma Medical Store (19.138, 72.836)
    [19.1380, 72.8360],
    [19.1374, 72.8372],
    [19.1365, 72.8385],
    [19.1352, 72.8396],
    [19.1338, 72.8407],
    // Stop 3: Patel Electronics (19.132, 72.842)
    [19.1320, 72.8420],
    [19.1310, 72.8432],
    [19.1301, 72.8446],
    [19.1292, 72.8462],
    [19.1285, 72.8478],
    // Stop 4: Royal Bakers Versova Link (19.128, 72.849)
    [19.1280, 72.8490],
    [19.1272, 72.8510],
    [19.1263, 72.8530],
    [19.1251, 72.8550],
    [19.1240, 72.8566],
    // Stop 5: Om Enterprises (19.123, 72.858)
    [19.1230, 72.8580],
    [19.1218, 72.8596],
    [19.1205, 72.8610],
    [19.1192, 72.8624],
    [19.1180, 72.8638],
    // Stop 6: Bright Coaching Jogeshwari/Andheri Kurla Rd (19.117, 72.865)
    [19.1170, 72.8650],
    [19.1174, 72.8668],
    [19.1180, 72.8686],
    [19.1187, 72.8708],
    [19.1194, 72.8732],
    [19.1201, 72.8756],
    [19.1206, 72.8774],
    // Stop 7: Sagar Supermarket Powai / Saki Naka (19.121, 72.879)
    [19.1210, 72.8790],
    [19.1202, 72.8808],
    [19.1191, 72.8826],
    [19.1178, 72.8845],
    [19.1162, 72.8864],
    [19.1145, 72.8882],
    [19.1131, 72.8897],
    // Stop 8: Krystal Tech Vikhroli Link / LBS Marg (19.112, 72.891)
    [19.1120, 72.8910],
    [19.1105, 72.8906],
    [19.1088, 72.8901],
    [19.1070, 72.8894],
    [19.1052, 72.8887],
    [19.1034, 72.8878],
    [19.1016, 72.8869],
    [19.0998, 72.8859],
    // Stop 9: Apollo Pharmacy Ghatkopar West LBS Marg (19.098, 72.885)
    [19.0980, 72.8850],
    [19.0962, 72.8841],
    [19.0944, 72.8831],
    [19.0925, 72.8820],
    [19.0906, 72.8808],
    [19.0887, 72.8794],
    [19.0868, 72.8778],
    [19.0849, 72.8760],
    [19.0832, 72.8740],
    // Stop 10: Zenith Fitness Studio / CST Road Junction (19.082, 72.872)
    [19.0820, 72.8720],
    [19.0805, 72.8714],
    [19.0790, 72.8709],
    [19.0775, 72.8703],
    [19.0760, 72.8698],
    [19.0745, 72.8692],
    [19.0728, 72.8686],
    // Stop 11: Metro Hardware Kurla West (19.071, 72.868)
    [19.0710, 72.8680],
    [19.0698, 72.8668],
    [19.0685, 72.8655],
    [19.0672, 72.8642],
    [19.0660, 72.8630],
    // Stop 12: BKC Regional Office End E (19.065, 72.862)
    [19.0650, 72.8620],
  ],
};
