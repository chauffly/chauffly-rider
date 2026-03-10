import { HttpClient } from '../http';
import { PaginatedResponse } from '../types';
import { withQuery } from './common';

export interface UpdateUserProfileInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  avatar_url?: string;
}

export interface SavedAddressInput {
  label: 'home' | 'office' | 'apartment' | 'other';
  custom_label?: string;
  address_line: string;
  coordinates: { lat: number; lng: number };
  is_pinned?: boolean;
}

export interface NotificationPreferencesInput {
  push_enabled?: boolean;
  sms_enabled?: boolean;
  email_enabled?: boolean;
  ride_updates?: boolean;
  promotions?: boolean;
  payment_alerts?: boolean;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export interface UsersApi {
  getCurrentUser(): Promise<Record<string, unknown>>;
  updateCurrentUser(input: UpdateUserProfileInput): Promise<Record<string, unknown>>;
  uploadAvatar(formData: FormData): Promise<Record<string, unknown>>;
  deleteCurrentUser(): Promise<{ message: string }>;

  listAddresses(): Promise<Array<Record<string, unknown>>>;
  createAddress(input: SavedAddressInput): Promise<Record<string, unknown>>;
  updateAddress(id: string, input: Partial<SavedAddressInput>): Promise<Record<string, unknown>>;
  deleteAddress(id: string): Promise<{ message: string }>;
  toggleAddressPin(id: string, pinned?: boolean): Promise<Record<string, unknown>>;

  listNotifications(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<Record<string, unknown>>>;
  markNotificationRead(id: string): Promise<Record<string, unknown>>;
  markAllNotificationsRead(): Promise<{ updated: number }>;

  getNotificationPreferences(): Promise<Record<string, unknown>>;
  updateNotificationPreferences(input: NotificationPreferencesInput): Promise<Record<string, unknown>>;

  changePassword(input: ChangePasswordInput): Promise<{ message: string }>;

  listSessions(params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<Record<string, unknown>>>;
  revokeSession(id: string): Promise<{ message: string }>;
}

export const createUsersApi = (http: HttpClient): UsersApi => {
  return {
    getCurrentUser() {
      return http.get('/users/me');
    },

    updateCurrentUser(input) {
      return http.put('/users/me', input);
    },

    uploadAvatar(formData) {
      return http.put('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },

    deleteCurrentUser() {
      return http.delete('/users/me');
    },

    listAddresses() {
      return http.get('/users/me/addresses');
    },

    createAddress(input) {
      return http.post('/users/me/addresses', input);
    },

    updateAddress(id, input) {
      return http.put(`/users/me/addresses/${id}`, input);
    },

    deleteAddress(id) {
      return http.delete(`/users/me/addresses/${id}`);
    },

    toggleAddressPin(id, pinned) {
      return http.patch(`/users/me/addresses/${id}/pin`, typeof pinned === 'boolean' ? { pinned } : {});
    },

    listNotifications(params) {
      return http.get(
        '/users/me/notifications',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    markNotificationRead(id) {
      return http.patch(`/users/me/notifications/${id}/read`);
    },

    markAllNotificationsRead() {
      return http.patch('/users/me/notifications/read-all');
    },

    getNotificationPreferences() {
      return http.get('/users/me/notification-preferences');
    },

    updateNotificationPreferences(input) {
      return http.put('/users/me/notification-preferences', input);
    },

    changePassword(input) {
      return http.put('/users/me/security/password', input);
    },

    listSessions(params) {
      return http.get(
        '/users/me/sessions',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    revokeSession(id) {
      return http.delete(`/users/me/sessions/${id}`);
    }
  };
};
