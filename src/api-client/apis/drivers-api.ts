import type { HttpClient } from '../http';
import type { DriverLocationUpdateInput, NearbyDriversInput, PaginatedResponse } from '../types';
import { withQuery } from './common';

export interface DriverStatusInput {
  is_online: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DriverProfileInput {
  license_number: string;
  license_expiry: string;
  member_since?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
    tier: string;
  };
}

export interface DriverVehicleInput {
  make: string;
  model: string;
  year: number;
  color: string;
  plate_number: string;
  tier: string;
}

export interface DriverDocumentsQuery {
  cursor?: string;
  limit?: number;
}

export interface DriversApi {
  createProfile(input: DriverProfileInput): Promise<Record<string, unknown>>;
  getMe(): Promise<Record<string, unknown>>;
  updateMe(input: Partial<DriverProfileInput>): Promise<Record<string, unknown>>;

  updateStatus(input: DriverStatusInput): Promise<Record<string, unknown>>;
  updateLocation(input: DriverLocationUpdateInput): Promise<Record<string, unknown>>;
  nearby(input: NearbyDriversInput): Promise<Array<Record<string, unknown>>>;

  uploadDocument(formData: FormData): Promise<Record<string, unknown>>;
  getDocuments(params?: DriverDocumentsQuery): Promise<PaginatedResponse<Record<string, unknown>>>;
  getVerificationStatus(): Promise<Record<string, unknown>>;

  registerVehicle(input: DriverVehicleInput): Promise<Record<string, unknown>>;
  updateVehicle(id: string, input: Partial<DriverVehicleInput>): Promise<Record<string, unknown>>;
  getVehicle(): Promise<Record<string, unknown> | null>;

  getEarnings(period: '1d' | '1w' | '1m' | '1y'): Promise<Record<string, unknown>>;
  getEarningsSummary(): Promise<Record<string, unknown>>;
  getPerformance(): Promise<Record<string, unknown>>;
}

export const createDriversApi = (http: HttpClient): DriversApi => {
  return {
    createProfile(input) {
      return http.post('/drivers/profile', input);
    },

    getMe() {
      return http.get('/drivers/me');
    },

    updateMe(input) {
      return http.put('/drivers/me', input);
    },

    updateStatus(input) {
      return http.patch('/drivers/me/status', input);
    },

    updateLocation(input) {
      return http.post('/drivers/me/location', input);
    },

    nearby(input) {
      return http.get(
        '/drivers/nearby',
        withQuery(undefined, {
          latitude: input.latitude,
          longitude: input.longitude,
          radius_km: input.radius_km,
          tier: input.tier
        })
      );
    },

    uploadDocument(formData) {
      return http.post('/drivers/me/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },

    getDocuments(params) {
      return http.get(
        '/drivers/me/documents',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    getVerificationStatus() {
      return http.get('/drivers/me/verification-status');
    },

    registerVehicle(input) {
      return http.post('/drivers/me/vehicle', input);
    },

    updateVehicle(id, input) {
      return http.put(`/drivers/me/vehicle/${id}`, input);
    },

    getVehicle() {
      return http.get('/drivers/me/vehicle');
    },

    getEarnings(period) {
      return http.get('/drivers/me/earnings', withQuery(undefined, { period }));
    },

    getEarningsSummary() {
      return http.get('/drivers/me/earnings/summary');
    },

    getPerformance() {
      return http.get('/drivers/me/performance');
    }
  };
};
