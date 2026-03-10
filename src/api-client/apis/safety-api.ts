import { HttpClient } from '../http';
import { withQuery } from './common';

export interface ReportIncidentInput {
  type: 'fraud' | 'sos' | 'incident' | 'kyc_review' | 'escalation';
  description: string;
  booking_id?: string;
}

export interface SafetyApi {
  reportIncident(input: ReportIncidentInput): Promise<Record<string, unknown>>;
  triggerSos(input: { description?: string; booking_id?: string; coordinates?: { lat: number; lng: number } }): Promise<Record<string, unknown>>;

  listIncidents(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  getIncidentById(id: string): Promise<Record<string, unknown>>;
  investigateIncident(id: string): Promise<Record<string, unknown>>;
  escalateIncident(id: string, reason?: string): Promise<Record<string, unknown>>;
  resolveIncident(id: string, resolution_notes: string): Promise<Record<string, unknown>>;

  listKycQueue(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  approveKycDocument(documentId: string): Promise<Record<string, unknown>>;
  rejectKycDocument(documentId: string, reason: string): Promise<Record<string, unknown>>;
}

export const createSafetyApi = (http: HttpClient): SafetyApi => {
  return {
    reportIncident(input) {
      return http.post('/incidents', input);
    },

    triggerSos(input) {
      return http.post('/sos', input);
    },

    listIncidents(params) {
      return http.get('/admin/incidents', withQuery(undefined, params ?? {}));
    },

    getIncidentById(id) {
      return http.get(`/admin/incidents/${id}`);
    },

    investigateIncident(id) {
      return http.patch(`/admin/incidents/${id}/investigate`);
    },

    escalateIncident(id, reason) {
      return http.patch(`/admin/incidents/${id}/escalate`, reason ? { reason } : {});
    },

    resolveIncident(id, resolution_notes) {
      return http.patch(`/admin/incidents/${id}/resolve`, {
        resolution_notes
      });
    },

    listKycQueue(params) {
      return http.get('/admin/kyc-queue', withQuery(undefined, params ?? {}));
    },

    approveKycDocument(documentId) {
      return http.patch(`/admin/kyc-queue/${documentId}/approve`);
    },

    rejectKycDocument(documentId, reason) {
      return http.patch(`/admin/kyc-queue/${documentId}/reject`, { reason });
    }
  };
};
