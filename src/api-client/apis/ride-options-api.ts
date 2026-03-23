import type { HttpClient } from '../http';

export interface RideOptionInput {
  name: string;
  description?: string;
  tier: string;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  surge_multiplier?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface RideOptionPricingInput {
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
}

export interface RideOptionsApi {
  list(): Promise<Array<Record<string, unknown>>>;
  getById(id: string): Promise<Record<string, unknown>>;

  adminList(): Promise<Array<Record<string, unknown>>>;
  adminCreate(input: RideOptionInput): Promise<Record<string, unknown>>;
  adminUpdate(id: string, input: Partial<RideOptionInput>): Promise<Record<string, unknown>>;
  adminUpdatePricing(id: string, input: RideOptionPricingInput): Promise<Record<string, unknown>>;
}

export const createRideOptionsApi = (http: HttpClient): RideOptionsApi => {
  return {
    list() {
      return http.get('/ride-options');
    },

    getById(id) {
      return http.get(`/ride-options/${id}`);
    },

    adminList() {
      return http.get('/admin/ride-options');
    },

    adminCreate(input) {
      return http.post('/admin/ride-options', input);
    },

    adminUpdate(id, input) {
      return http.put(`/admin/ride-options/${id}`, input);
    },

    adminUpdatePricing(id, input) {
      return http.put(`/admin/ride-options/${id}/pricing`, input);
    }
  };
};
