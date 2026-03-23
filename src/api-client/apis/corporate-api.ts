import type { HttpClient } from '../http';
import { withQuery } from './common';

export interface OrganizationInput {
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  plan: 'startup' | 'business' | 'enterprise';
}

export interface CorporateTravelPolicyInput {
  max_fare_per_trip?: number | null;
  allowed_tiers?: string[] | null;
  allowed_hours?: Record<string, unknown> | null;
  budget_period?: 'daily' | 'weekly' | 'monthly';
  budget_limit?: number | null;
}

export interface CorporateApi {
  registerOrganization(input: OrganizationInput): Promise<Record<string, unknown>>;
  getOrganization(): Promise<Record<string, unknown>>;
  updateOrganization(input: Partial<OrganizationInput>): Promise<Record<string, unknown>>;

  inviteEmployee(input: { email: string }): Promise<Record<string, unknown>>;
  listEmployees(params?: { status?: string; cursor?: string; limit?: number }): Promise<Record<string, unknown>>;
  removeEmployee(id: string): Promise<Record<string, unknown>>;

  listJoinRequests(params?: { cursor?: string; limit?: number }): Promise<Record<string, unknown>>;
  decideJoinRequest(id: string, approved: boolean): Promise<Record<string, unknown>>;
  requestJoinCompany(input: { organization_code?: string; organization_name?: string }): Promise<Record<string, unknown>>;

  getTravelPolicies(): Promise<Record<string, unknown>>;
  updateTravelPolicies(input: CorporateTravelPolicyInput): Promise<Record<string, unknown>>;

  getSummary(period: 'today' | 'last_7_days' | 'last_30_days'): Promise<Record<string, unknown>>;
  getUsage(params?: { cursor?: string; limit?: number }): Promise<Record<string, unknown>>;
  listInvoices(params?: { cursor?: string; limit?: number }): Promise<Record<string, unknown>>;
  getInvoiceDetail(id: string): Promise<Record<string, unknown>>;
}

export const createCorporateApi = (http: HttpClient): CorporateApi => {
  return {
    registerOrganization(input) {
      return http.post('/corporate/organizations', input);
    },

    getOrganization() {
      return http.get('/corporate/organization');
    },

    updateOrganization(input) {
      return http.put('/corporate/organization', input);
    },

    inviteEmployee(input) {
      return http.post('/corporate/employees', input);
    },

    listEmployees(params) {
      return http.get(
        '/corporate/employees',
        withQuery(undefined, {
          status: params?.status,
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    removeEmployee(id) {
      return http.patch(`/corporate/employees/${id}/remove`);
    },

    listJoinRequests(params) {
      return http.get(
        '/corporate/join-requests',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    decideJoinRequest(id, approved) {
      return http.patch(`/corporate/join-requests/${id}`, {
        decision: approved ? 'approve' : 'reject'
      });
    },

    requestJoinCompany(input) {
      return http.post('/riders/me/join-company', input);
    },

    getTravelPolicies() {
      return http.get('/corporate/travel-policies');
    },

    updateTravelPolicies(input) {
      return http.put('/corporate/travel-policies', input);
    },

    getSummary(period) {
      return http.get('/corporate/summary', withQuery(undefined, { period }));
    },

    getUsage(params) {
      return http.get(
        '/corporate/usage',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    listInvoices(params) {
      return http.get(
        '/corporate/invoices',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    getInvoiceDetail(id) {
      return http.get(`/corporate/invoices/${id}`);
    }
  };
};
