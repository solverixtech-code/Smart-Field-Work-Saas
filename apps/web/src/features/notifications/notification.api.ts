import { api } from '../../common/api';

const root = '/tenant/crm/notifications';

export interface NotificationOverview {
  totalCampaigns: number;
  sentCampaigns: number;
  scheduledCampaigns: number;
  activePushDevices: number;
  deliverySuccessRate: number;
  simulationMode: boolean;
}

export interface CampaignRecord {
  id: string;
  title: string;
  body: string;
  type: string;
  channels: string[];
  targetAudience: string;
  targetFilter?: any;
  priority: string;
  status: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  actionUrl?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PushTokenRecord {
  id: string;
  token: string;
  maskedToken: string;
  platform: string;
  deviceModel: string;
  appVersion: string;
  isActive: boolean;
  lastSeenAt: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone?: string | null;
  } | null;
}

export interface PushTokensOverview {
  totalTokens: number;
  activeTokens: number;
  inactiveTokens: number;
  tokens: PushTokenRecord[];
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  channels: string[];
  isActive: boolean;
  createdAt: string;
}

export interface InAppNotificationItem {
  id: string;
  notificationId: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  actionUrl?: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface InAppFeedResponse {
  unreadCount: number;
  notifications: InAppNotificationItem[];
}

export interface CreateCampaignDto {
  title: string;
  body: string;
  channels: string[];
  category: string;
  priority?: string;
  audienceType: string;
  targetRoles?: string[];
  targetTerritories?: string[];
  targetMembershipIds?: string[];
  scheduledAt?: string;
  actionUrl?: string;
}

export interface SendTestPushDto {
  fcmToken?: string;
  targetMembershipId?: string;
  title: string;
  body: string;
  actionUrl?: string;
}

export const notificationApi = {
  getOverview: async (signal?: AbortSignal): Promise<NotificationOverview> => {
    const res = await api.get(`${root}/overview`, { signal });
    return res.data;
  },

  listCampaigns: async (
    params?: {
      search?: string;
      status?: string;
      category?: string;
      channel?: string;
      priority?: string;
      page?: number;
      limit?: number;
    },
    signal?: AbortSignal,
  ): Promise<{ data: CampaignRecord[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const res = await api.get(`${root}`, { params, signal });
    return res.data;
  },

  createCampaign: async (
    data: CreateCampaignDto,
    signal?: AbortSignal,
  ): Promise<CampaignRecord> => {
    const res = await api.post(`${root}`, data, { signal });
    return res.data;
  },

  sendTestPush: async (
    data: SendTestPushDto,
    signal?: AbortSignal,
  ): Promise<{
    message: string;
    targetedTokensCount: number;
    successCount: number;
    failureCount: number;
    simulationMode: boolean;
    errors?: any[];
  }> => {
    const res = await api.post(`${root}/test-push`, data, { signal });
    return res.data;
  },

  sendExecutiveAlert: async (
    data: {
      title: string;
      message: string;
      priority: 'HIGH' | 'URGENT';
      targetRoles?: string[];
      actionUrl?: string;
    },
    signal?: AbortSignal,
  ) => {
    const res = await api.post(`${root}/executive-alert`, data, { signal });
    return res.data;
  },

  getPushTokens: async (signal?: AbortSignal): Promise<PushTokensOverview> => {
    const res = await api.get(`${root}/push-tokens`, { signal });
    return res.data;
  },

  registerDeviceToken: async (
    data: {
      token: string;
      platform: string;
      deviceModel?: string;
      appVersion?: string;
    },
    signal?: AbortSignal,
  ) => {
    const res = await api.post(`${root}/devices/register`, data, { signal });
    return res.data;
  },

  unregisterDeviceToken: async (token: string, signal?: AbortSignal) => {
    const res = await api.post(`${root}/devices/unregister`, { token }, { signal });
    return res.data;
  },

  getInAppFeed: async (signal?: AbortSignal): Promise<InAppFeedResponse> => {
    const res = await api.get(`${root}/in-app`, { signal });
    return res.data;
  },

  markAsRead: async (logId: string, signal?: AbortSignal) => {
    const res = await api.patch(`${root}/in-app/${logId}/read`, {}, { signal });
    return res.data;
  },

  markAllAsRead: async (signal?: AbortSignal) => {
    const res = await api.patch(`${root}/in-app/read-all`, {}, { signal });
    return res.data;
  },

  listTemplates: async (signal?: AbortSignal): Promise<NotificationTemplate[]> => {
    const res = await api.get(`${root}/templates`, { signal });
    return res.data;
  },

  createTemplate: async (
    data: {
      name: string;
      category: string;
      titleTemplate: string;
      bodyTemplate: string;
      defaultChannels?: string[];
      defaultPriority?: string;
    },
    signal?: AbortSignal,
  ): Promise<NotificationTemplate> => {
    const res = await api.post(`${root}/templates`, data, { signal });
    return res.data;
  },

  updateTemplate: async (
    id: string,
    data: Partial<{
      name: string;
      category: string;
      titleTemplate: string;
      bodyTemplate: string;
      defaultChannels: string[];
      isActive: boolean;
    }>,
    signal?: AbortSignal,
  ): Promise<NotificationTemplate> => {
    const res = await api.patch(`${root}/templates/${id}`, data, { signal });
    return res.data;
  },

  deleteTemplate: async (id: string, signal?: AbortSignal) => {
    await api.delete(`${root}/templates/${id}`, { signal });
  },
};
