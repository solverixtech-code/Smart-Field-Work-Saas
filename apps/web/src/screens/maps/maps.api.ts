import { api } from '../../common/api';

export type ExecutiveMapStatus = 'On Field' | 'In Transit' | 'Break' | 'Offline' | 'Vehicle';

export interface ExecutiveLocation {
  id: string;
  code?: string;
  name: string;
  avatar: string | null;
  designation?: string | null;
  status: ExecutiveMapStatus;
  currentLocation: string;
  lastUpdatedAt?: string | null;
  lastUpdated?: string;
  batteryLevel: number | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  team: string;
  visitsTodayCompleted: number;
  visitsTodayTotal: number;
  distanceKmToday: number;
  speedKmh?: number | null;
  demoCompletedToday?: boolean;
  geofenceAlert?: boolean;
}

export interface MapActivity {
  id: string;
  executiveId: string;
  executiveName: string;
  avatar: string | null;
  action: string;
  location: string;
  occurredAt: string;
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
  lastVisitAt?: string;
  lastVisitTime?: string;
  lat: number;
  lng: number;
  region: string;
  detailPath?: string;
  assigned?: boolean;
  visitedInRange?: boolean;
  hot?: boolean;
  convertedThisMonth?: boolean;
}

export interface HeatmapPoint {
  id: string;
  areaName: string;
  lat: number;
  lng: number;
  intensity: number;
  count: number;
  value: number;
  occurredAt?: string;
  territoryName?: string | null;
}

export interface TerritoryPolygon {
  id: string;
  code: string;
  name: string;
  centerLat: number;
  centerLng: number;
  executivesCount: number;
  targetAmount: number;
  achievedAmount: number;
  achievementPercentage: number;
  fillColor: string;
  borderColor: string;
  pathPoints: [number, number][];
}

export interface MapSnapshot {
  startDate: string;
  endDate: string;
  timezone: string;
  summary: {
    totalExecutives: number;
    activeExecutives: number;
    onField: number;
    inTransit: number;
    onBreak: number;
    offline: number;
    visits: number;
    completedVisits: number;
    todayVisits: number;
    todayCompletedVisits: number;
    visitMinutes: number;
    distanceKm: number;
    geofenceAlerts: number;
    prospects: number;
    salesAmount: number;
    salesOrders: number;
    locatedSalesAmount: number;
    territories: number;
    territoryExecutives: number;
    territoryTarget: number;
    territoryAchieved: number;
    territoryAchievement: number;
  };
  executives: ExecutiveLocation[];
  activities: MapActivity[];
  prospects: BusinessProspectMarker[];
  visitHeatmap: HeatmapPoint[];
  salesHeatmap: HeatmapPoint[];
  territories: TerritoryPolygon[];
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
  executiveCode?: string;
  executiveName: string;
  executiveAvatar: string | null;
  status: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  totalDurationText: string;
  totalDistanceKm: number;
  totalVisitsPlanned: number;
  totalVisitsCompleted: number;
  avgSpeedKmh: number;
  stops: RouteStop[];
  detailedRoadPath?: [number, number][];
}

export const mapsApi = {
  snapshot(params?: { startDate?: string; endDate?: string }) {
    return api.get<MapSnapshot>('/tenant/crm/maps/snapshot', { params }).then(({ data }) => data);
  },
  route(membershipId: string, date?: string) {
    return api.get<ExecutiveRoute>(`/tenant/crm/maps/routes/${membershipId}`, { params: date ? { date } : undefined }).then(({ data }) => data);
  },
};

export const mapDate = (value: string | null | undefined, timezone = 'Asia/Kolkata') => value
  ? new Intl.DateTimeFormat('en-IN', { timeZone: timezone, hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  : 'Not reported';

export const mapCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value);

export const mapAvatar = (name: string, avatar: string | null | undefined) => avatar ??
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2E8F0&color=0D1F3D`;
