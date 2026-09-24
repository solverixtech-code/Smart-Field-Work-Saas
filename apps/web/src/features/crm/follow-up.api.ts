import { api } from "../../common/api";

export type FollowUpView =
  "all" | "today" | "upcoming" | "overdue" | "completed";

export interface FollowUpRecord {
  id: string;
  leadId: string;
  assignedMembershipId: string | null;
  assignedToName: string;
  title: string;
  type?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  notes: string | null;
  status: "Pending" | "Completed" | "Cancelled";
  completedAt: string | null;
  completionNote: string | null;
  createdAt: string;
  updatedAt: string;
  assignedMembership: {
    designation: string | null;
    user: { fullName: string; avatarUrl: string | null };
    team: { name: string } | null;
  } | null;
  completedByMembership: {
    id: string;
    designation: string | null;
    user: { fullName: string; avatarUrl: string | null };
  } | null;
  lead: {
    id: string;
    leadCode: string;
    name: string;
    businessName: string | null;
    contactName: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    city: string | null;
    priority: string;
    status: string;
  };
}

export interface FollowUpPage {
  items: FollowUpRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  today: string;
  summary: {
    completed: number;
    pending: number;
    overdue: number;
    today: number;
  };
}

export const followUpApi = {
  list: async (
    params: {
      view: FollowUpView;
      page: number;
      limit: number;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      assignedMembershipId?: string;
    },
    signal: AbortSignal,
  ): Promise<FollowUpPage> =>
    (await api.get("/tenant/crm/follow-ups", { params, signal })).data,
  get: async (id: string, signal: AbortSignal): Promise<FollowUpRecord> =>
    (await api.get(`/tenant/crm/follow-ups/${id}`, { signal })).data,
};
