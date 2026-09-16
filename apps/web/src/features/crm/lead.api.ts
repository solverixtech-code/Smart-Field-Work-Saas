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
};
