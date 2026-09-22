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
  leadId: string;
  executiveMembershipId: string;
  executiveName: string;
  executiveAvatar: string | null;
  checkInTime: string;
  checkOutTime: string | null;
  durationMinutes: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  purpose: string;
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
  };
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
};
