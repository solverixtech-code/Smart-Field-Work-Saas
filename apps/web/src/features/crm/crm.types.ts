import type { LeadApi } from "./lead.types";
export type CrmStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface OwnerOption {
  avatarUrl?: string | null;
  role?: string | null;
  id: string;
  displayName: string;
}
export interface ContactInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  roleValueId?: string | null;
  status?: CrmStatus;
}
export interface ContactDto extends ContactInput {
  id: string;
  tenantId: string;
  accountId: string | null;
  ownerMembershipId: string | null;
  owner: OwnerOption | null;
  isPrimary: boolean;
  revision: number;
  role: string | null;
  status: CrmStatus;
  createdAt: string;
  updatedAt: string;
}
export interface AccountInput {
  name: string;
  businessTypeValueId?: string | null;
  sourceValueId?: string | null;
  categoryLabel?: string | null;
  status?: CrmStatus;
  ownerMembershipId?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  website?: string | null;
  gstin?: string | null;
  establishedYear?: number | null;
  description?: string | null;
  primaryContact?: ContactInput;
}
export interface AccountDto extends Omit<AccountInput, "primaryContact"> {
  id: string;
  tenantId: string;
  revision: number;
  status: CrmStatus;
  owner: OwnerOption;
  businessType: string | null;
  source: string | null;
  primaryContact?: ContactDto | null;
  createdAt: string;
  updatedAt: string;
}
export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CrmStatus;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
  businessTypeValueId?: string;
  sourceValueId?: string;
  city?: string;
  ownerMembershipId?: string;
}
export interface MasterOption {
  id: string;
  name: string;
  selectable: boolean;
}
export type MasterCode = "business_type" | "lead_source" | "contact_role";
export interface CrmService {
  leads: LeadApi;
  accounts(query: ListQuery, signal: AbortSignal): Promise<Page<AccountDto>>;
  account(id: string, signal: AbortSignal): Promise<AccountDto>;
  createAccount(body: AccountInput, signal: AbortSignal): Promise<AccountDto>;
  updateAccount(
    id: string,
    body: Omit<AccountInput, "primaryContact"> & { expectedRevision: number },
    signal: AbortSignal,
  ): Promise<AccountDto>;
  deleteAccount(
    id: string,
    revision: number,
    signal: AbortSignal,
  ): Promise<void>;
  contacts(
    accountId: string | null,
    query: ListQuery & { standalone?: "true" },
    signal: AbortSignal,
  ): Promise<Page<ContactDto>>;
  contact(id: string, signal: AbortSignal): Promise<ContactDto>;
  createContact(
    accountId: string,
    body: ContactInput,
    signal: AbortSignal,
  ): Promise<ContactDto>;
  updateContact(
    id: string,
    body: ContactInput & { expectedRevision: number },
    signal: AbortSignal,
  ): Promise<ContactDto>;
  deleteContact(
    id: string,
    revision: number,
    signal: AbortSignal,
  ): Promise<void>;
  primary(
    accountId: string,
    contactId: string | null,
    revision: number,
    signal: AbortSignal,
  ): Promise<{ account: AccountDto; changedContacts: ContactDto[] }>;
  owners(query: ListQuery, signal: AbortSignal): Promise<Page<OwnerOption>>;
  masters(
    code: MasterCode,
    query: ListQuery,
    signal: AbortSignal,
  ): Promise<Page<MasterOption>>;
}
