import { api } from "../../common/api";

export type VisitView =
  | "all"
  | "today"
  | "scheduled"
  | "completed"
  | "missed"
  | "verified"
  | "unverified";

export interface VisitRecord {
  id: string;
  leadId: string | null;
  accountId: string | null;
  targetType: "ACCOUNT" | "LEAD" | "QUICK_ADDRESS";
  targetName: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  executiveMembershipId: string;
  createdByMembershipId: string;
  executiveName: string;
  executiveAvatar: string | null;
  checkInTime: string;
  checkOutTime: string | null;
  scheduledEndTime: string | null;
  durationMinutes: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  purpose: string;
  visitType: string;
  priority: string;
  recurrence: string;
  routeArea: string | null;
  travelMode: string | null;
  geofenceRadiusMeters: number;
  allowManualCheckIn: boolean;
  instructions: string | null;
  checklist: string[];
  outcome: string | null;
  photos: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  executiveMembership: {
    designation: string | null;
    user: {
      fullName: string;
      avatarUrl: string | null;
      mobile: string | null;
      email: string;
    };
    team: { name: string } | null;
  };
  lead: {
    id: string;
    leadCode: string;
    name: string;
    businessName: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    priority: string;
    status: string;
    accountId: string | null;
  } | null;
  account: {
    id: string;
    name: string;
    categoryLabel: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    status: string;
  } | null;
}

export interface ScheduleVisitInput {
  targetType: "ACCOUNT" | "LEAD" | "QUICK_ADDRESS";
  targetId?: string;
  targetName: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters: number;
  visitType: "Sales Visit" | "Follow-up" | "Collection" | "Requirement Discussion" | "Product Demo" | "Onboarding";
  purpose: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  priority: "High" | "Medium" | "Low";
  recurrence: "None" | "Weekly" | "Bi-Weekly" | "Monthly";
  executiveMembershipId?: string;
  routeArea?: string;
  travelMode: "Bike" | "Scooter" | "Car" | "Public Transport";
  allowManualCheckIn: boolean;
  instructions?: string;
  checklist: string[];
}

export interface VisitExecutiveOption {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  team: string | null;
  territories: string[];
  scheduledVisitCount: number;
}

export interface VisitAvailability {
  available: boolean;
  conflictingVisitCount: number;
  scheduledVisitCount: number;
}

export interface VisitPage {
  items: VisitRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  today: string;
  summary: {
    all: number;
    today: number;
    scheduled: number;
    completed: number;
    missed: number;
    verified: number;
    unverified: number;
  };
}

export const visitApi = {
  list: async (
    params: {
      view: VisitView;
      page: number;
      limit: number;
      search?: string;
      executiveMembershipId?: string;
    },
    signal: AbortSignal,
  ): Promise<VisitPage> =>
    (await api.get("/tenant/crm/visits", { params, signal })).data,
  get: async (id: string, signal: AbortSignal): Promise<VisitRecord> =>
    (await api.get(`/tenant/crm/visits/${id}`, { signal })).data,
  executiveOptions: async (
    date: string,
    signal: AbortSignal,
  ): Promise<{ date: string; items: VisitExecutiveOption[] }> =>
    (await api.get("/tenant/crm/visits/executive-options", {
      params: { date },
      signal,
    })).data,
  availability: async (
    params: {
      executiveMembershipId?: string;
      scheduledDate: string;
      startTime: string;
      endTime: string;
    },
    signal: AbortSignal,
  ): Promise<VisitAvailability> =>
    (await api.get("/tenant/crm/visits/availability", { params, signal })).data,
  create: async (
    body: ScheduleVisitInput,
    signal: AbortSignal,
  ): Promise<VisitRecord> =>
    (await api.post("/tenant/crm/visits", body, { signal })).data,
};
