import type { HttpClient } from '../http';
import type { BookingCreateInput, BookingEstimateInput, BookingTab, PaginatedResponse } from '../types';
import { withQuery } from './common';

export interface BookingActionResponse {
  bookingId: string;
  status: string;
  [key: string]: unknown;
}

export interface BookingRatingInput {
  rating: number;
  comment?: string;
}

export interface BookingCancelInput {
  reason: string;
}

export interface BookingListParams {
  cursor?: string;
  limit?: number;
  tab?: BookingTab;
}

export interface BookingLifecycleCompleteInput {
  distance_km?: number;
  duration_minutes?: number;
}

export interface BookingArriveStopInput {
  stop_id: string;
}

export interface VerifyPinInput {
  pin: string;
}

export interface BookingsApi {
  estimate(input: BookingEstimateInput): Promise<Record<string, unknown>>;
  create(input: BookingCreateInput, idempotencyKey?: string): Promise<Record<string, unknown>>;
  getActive(): Promise<Record<string, unknown> | null>;
  getById(id: string): Promise<Record<string, unknown>>;
  list(params?: BookingListParams): Promise<PaginatedResponse<Record<string, unknown>>>;

  accept(id: string): Promise<BookingActionResponse>;
  decline(id: string, reason?: string): Promise<BookingActionResponse>;
  arrived(id: string): Promise<BookingActionResponse>;
  verifyPin(id: string, input: VerifyPinInput): Promise<BookingActionResponse>;
  arriveStop(id: string, input: BookingArriveStopInput): Promise<BookingActionResponse>;
  complete(id: string, input?: BookingLifecycleCompleteInput): Promise<BookingActionResponse>;
  cancel(id: string, input: BookingCancelInput): Promise<BookingActionResponse>;
  rate(id: string, input: BookingRatingInput): Promise<Record<string, unknown>>;

  driverResponse(id: string, accepted: boolean, reason?: string): Promise<BookingActionResponse>;
}

export const createBookingsApi = (http: HttpClient): BookingsApi => {
  return {
    estimate(input) {
      return http.post('/bookings/estimate', input);
    },

    create(input, idempotencyKey) {
      return http.post('/bookings', input, {
        headers: idempotencyKey
          ? {
              'Idempotency-Key': idempotencyKey
            }
          : undefined
      });
    },

    getActive() {
      return http.get('/bookings/active');
    },

    getById(id) {
      return http.get(`/bookings/${id}`);
    },

    list(params) {
      return http.get(
        '/bookings',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit,
          tab: params?.tab
        })
      );
    },

    accept(id) {
      return http.patch(`/bookings/${id}/accept`);
    },

    decline(id, reason) {
      return http.patch(`/bookings/${id}/decline`, reason ? { reason } : {});
    },

    arrived(id) {
      return http.patch(`/bookings/${id}/arrived`);
    },

    verifyPin(id, input) {
      return http.patch(`/bookings/${id}/verify-pin`, input);
    },

    arriveStop(id, input) {
      return http.patch(`/bookings/${id}/arrive-stop`, input);
    },

    complete(id, input) {
      return http.patch(`/bookings/${id}/complete`, input ?? {});
    },

    cancel(id, input) {
      return http.post(`/bookings/${id}/cancel`, input);
    },

    rate(id, input) {
      return http.post(`/bookings/${id}/rate`, input);
    },

    driverResponse(id, accepted, reason) {
      return http.post(`/bookings/${id}/driver-response`, {
        accepted,
        reason
      });
    }
  };
};
