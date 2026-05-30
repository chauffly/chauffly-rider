import type { HttpClient } from '../http';
import { withQuery } from './common';

export interface GenerateReportInput {
  type:
    | 'revenue'
    | 'driver_performance'
    | 'trip_analytics'
    | 'safety_incidents'
    | 'corporate_billing'
    | 'fleet_utilization'
    | 'fraud_detection';
  period_start: string;
  period_end: string;
  format: 'csv' | 'pdf';
}

export interface AnalyticsApi {
  overview(period?: string): Promise<Record<string, unknown>>;
  revenue(period?: string): Promise<Record<string, unknown>>;
  trips(period?: string): Promise<Record<string, unknown>>;
  driverUtilization(date?: string): Promise<Record<string, unknown>>;
  topRoutes(limit?: number): Promise<Record<string, unknown>>;

  listReports(): Promise<Record<string, unknown>>;
  generateReport(input: GenerateReportInput): Promise<Record<string, unknown>>;
  downloadReport(id: string): Promise<Record<string, unknown>>;

  exportTransactions(params?: Record<string, unknown>): Promise<Blob | string>;
  exportBookings(params?: Record<string, unknown>): Promise<Blob | string>;
  exportDrivers(params?: Record<string, unknown>): Promise<Blob | string>;
}

export const createAnalyticsApi = (http: HttpClient): AnalyticsApi => {
  return {
    overview(period = 'month') {
      return http.get('/admin/analytics/overview', withQuery(undefined, { period }));
    },

    revenue(period = '6m') {
      return http.get('/admin/analytics/revenue', withQuery(undefined, { period }));
    },

    trips(period = 'month') {
      return http.get('/admin/analytics/trips', withQuery(undefined, { period }));
    },

    driverUtilization(date = 'today') {
      return http.get('/admin/analytics/driver-utilization', withQuery(undefined, { date }));
    },

    topRoutes(limit = 10) {
      return http.get('/admin/analytics/top-routes', withQuery(undefined, { limit }));
    },

    listReports() {
      return http.get('/admin/reports');
    },

    generateReport(input) {
      return http.post('/admin/reports/generate', input);
    },

    downloadReport(id) {
      return http.get(`/admin/reports/${id}/download`);
    },

    exportTransactions(params) {
      return http.get('/admin/export/transactions', withQuery({ responseType: 'blob' }, params ?? {}));
    },

    exportBookings(params) {
      return http.get('/admin/export/bookings', withQuery({ responseType: 'blob' }, params ?? {}));
    },

    exportDrivers(params) {
      return http.get('/admin/export/drivers', withQuery({ responseType: 'blob' }, params ?? {}));
    }
  };
};
