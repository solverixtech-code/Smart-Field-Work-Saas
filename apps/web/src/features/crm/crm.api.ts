import { leadApi } from "./lead.api";
import { api } from "../../common/api";
import type { CrmService } from "./crm.types";
const root = "/tenant/crm";
export const crmApi: CrmService = {
  leads: leadApi,
  accounts: async (params, signal) =>
    (await api.get(`${root}/accounts`, { params, signal })).data,
  account: async (id, signal) =>
    (await api.get(`${root}/accounts/${id}`, { signal })).data,
  createAccount: async (body, signal) =>
    (await api.post(`${root}/accounts`, body, { signal })).data,
  updateAccount: async (id, body, signal) =>
    (await api.patch(`${root}/accounts/${id}`, body, { signal })).data,
  deleteAccount: async (id, expectedRevision, signal) => {
    await api.delete(`${root}/accounts/${id}`, {
      data: { expectedRevision },
      signal,
    });
  },
  contacts: async (id, params, signal) =>
    (
      await api.get(
        id ? `${root}/accounts/${id}/contacts` : `${root}/contacts`,
        { params, signal },
      )
    ).data,
  contact: async (id, signal) =>
    (await api.get(`${root}/contacts/${id}`, { signal })).data,
  createContact: async (id, body, signal) =>
    (await api.post(`${root}/accounts/${id}/contacts`, body, { signal })).data,
  updateContact: async (id, body, signal) =>
    (await api.patch(`${root}/contacts/${id}`, body, { signal })).data,
  deleteContact: async (id, expectedRevision, signal) => {
    await api.delete(`${root}/contacts/${id}`, {
      data: { expectedRevision },
      signal,
    });
  },
  primary: async (id, contactId, expectedRevision, signal) =>
    (
      await api.patch(
        `${root}/accounts/${id}/primary-contact`,
        { contactId, expectedRevision },
        { signal },
      )
    ).data,
  owners: async (params, signal) =>
    (await api.get(`${root}/owner-options`, { params, signal })).data,
  masters: async (code, params, signal) =>
    (await api.get(`/tenant/masters/${code}/values`, { params, signal })).data,

  deals: async (params, signal) =>
    (await api.get(`${root}/deals`, { params, signal })).data,
  dealSummary: async (signal) =>
    (await api.get(`${root}/deals/summary`, { signal })).data,
  deal: async (id, signal) =>
    (await api.get(`${root}/deals/${id}`, { signal })).data,
  createDeal: async (body, signal) =>
    (await api.post(`${root}/deals`, body, { signal })).data,
  updateDeal: async (id, body, signal) =>
    (await api.patch(`${root}/deals/${id}`, body, { signal })).data,
  updateDealStage: async (id, body, signal) =>
    (await api.patch(`${root}/deals/${id}/stage`, body, { signal })).data,
  deleteDeal: async (id, signal) => {
    await api.delete(`${root}/deals/${id}`, { signal });
  },
};
