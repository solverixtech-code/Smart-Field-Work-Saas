import { api } from "../../common/api";
import type { LeadApi } from "./lead.types";
const root = "/tenant/crm/leads";
export const leadApi: LeadApi = {
  list: async (params, signal) =>
    (await api.get(root, { params, signal })).data,
  counts: async (params, signal) =>
    (await api.get(root + "/counts", { params, signal })).data,
  summary: async (params, signal) =>
    (await api.get(root + "/summary", { params, signal })).data,
  get: async (id, signal) => (await api.get(root + "/" + id, { signal })).data,
  create: async (body, signal) => (await api.post(root, body, { signal })).data,
  update: async (id, body, signal) =>
    (await api.patch(root + "/" + id, body, { signal })).data,
  assign: async (id, body, signal) =>
    (await api.patch(root + "/" + id + "/assignment", body, { signal })).data,
  remove: async (id, expectedRevision, signal) => {
    await api.delete(root + "/" + id, { data: { expectedRevision }, signal });
  },
  convert: async (id, body, signal) =>
    (await api.post(root + "/" + id + "/convert", body, { signal })).data,
  owners: async (params, signal) =>
    (await api.get(root + "/owner-options", { params, signal })).data,
  bulkAssign: async (body, signal) =>
    (await api.post(root + "/bulk-assign", body, { signal })).data,
  importPreview: async (body, signal) =>
    (await api.post(root + "/import/preview", body, { signal })).data,
  importLeads: async (body, signal) =>
    (await api.post(root + "/import", body, { signal })).data,
  exportCsv: async (params, signal) =>
    (await api.get(root + "/export", { params, signal, responseType: "blob" }))
      .data,
  history: async (id, signal) =>
    (await api.get(root + "/" + id + "/history", { signal })).data,
  addNote: async (id, body, signal) =>
    (await api.post(root + "/" + id + "/notes", body, { signal })).data,
  visits: async (id, signal) =>
    (await api.get(root + "/" + id + "/visits", { signal })).data,
  createVisit: async (id, body, signal) =>
    (await api.post(root + "/" + id + "/visits", body, { signal })).data,
  followUps: async (id, signal) =>
    (await api.get(root + "/" + id + "/follow-ups", { signal })).data,
  createFollowUp: async (id, body, signal) =>
    (await api.post(root + "/" + id + "/follow-ups", body, { signal })).data,
  updateFollowUp: async (id, followUpId, body, signal) =>
    (await api.patch(root + "/" + id + "/follow-ups/" + followUpId, body, { signal })).data,
  deleteFollowUp: async (id, followUpId, signal) => {
    await api.delete(root + "/" + id + "/follow-ups/" + followUpId, { signal });
  },
  demos: async (id, signal) =>
    (await api.get(root + "/" + id + "/demos", { signal })).data,
  createDemo: async (id, body, signal) =>
    (await api.post(root + "/" + id + "/demos", body, { signal })).data,
  communications: async (id, signal) =>
    (await api.get(root + "/" + id + "/communications", { signal })).data,
  createCommunication: async (id, body, signal) =>
    (await api.post(root + "/" + id + "/communications", body, { signal })).data,
};

