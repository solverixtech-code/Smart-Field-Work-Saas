import { api } from '../../common/api';
import type {
  ListRolesResponse,
  RoleDetailResponse,
  CreateRolePayload,
  UpdateRolePayload,
  DuplicateRolePayload,
} from './role.types';

const root = '/tenant/roles';

export const roleApi = {
  listRoles: async (params?: { q?: string; status?: string }): Promise<ListRolesResponse> => {
    const res = await api.get<ListRolesResponse>(root, { params });
    return res.data;
  },

  getRole: async (id: string): Promise<RoleDetailResponse> => {
    const res = await api.get<RoleDetailResponse>(`${root}/${id}`);
    return res.data;
  },

  createRole: async (payload: CreateRolePayload) => {
    const res = await api.post(root, payload);
    return res.data;
  },

  updateRole: async (id: string, payload: UpdateRolePayload) => {
    const res = await api.patch(`${root}/${id}`, payload);
    return res.data;
  },

  updatePermissions: async (id: string, permissionCodes: string[]) => {
    const res = await api.put<{ success: boolean; permissionsVersion: number; grantedCount: number }>(
      `${root}/${id}/permissions`,
      { permissionCodes },
    );
    return res.data;
  },

  duplicateRole: async (id: string, payload: DuplicateRolePayload) => {
    const res = await api.post(`${root}/${id}/duplicate`, payload);
    return res.data;
  },

  syncTemplates: async () => {
    const res = await api.post<{ success: boolean; message: string }>(`${root}/sync`);
    return res.data;
  },

  deleteRole: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`${root}/${id}`);
    return res.data;
  },
};
