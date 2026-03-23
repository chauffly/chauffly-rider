import type { HttpClient } from '../http';
import { withQuery } from './common';

export interface AdminApi {
  listRoles(): Promise<Record<string, unknown>>;
  updateRole(role: string, permissions: Record<string, unknown>): Promise<Record<string, unknown>>;

  getDashboard(): Promise<Record<string, unknown>>;
  getDashboardLive(): Promise<Record<string, unknown>>;

  listUsers(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  getUserById(id: string): Promise<Record<string, unknown>>;
  verifyUser(id: string): Promise<Record<string, unknown>>;
  suspendUser(id: string, reason?: string): Promise<Record<string, unknown>>;
  activateUser(id: string): Promise<Record<string, unknown>>;
  deactivateUser(id: string): Promise<Record<string, unknown>>;
  listUserTrips(id: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;

  listDrivers(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  getDriverById(id: string): Promise<Record<string, unknown>>;
  verifyDriver(id: string, approved: boolean, reason?: string): Promise<Record<string, unknown>>;
  suspendDriver(id: string, reason: string): Promise<Record<string, unknown>>;
  messageDriver(id: string, title: string, body: string, data?: Record<string, unknown>): Promise<Record<string, unknown>>;

  listBookings(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  assignDriverToBooking(id: string, driverId: string): Promise<Record<string, unknown>>;
  cancelBooking(id: string, reason: string, refund?: boolean): Promise<Record<string, unknown>>;

  listVehicles(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  createVehicle(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateVehicle(id: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteVehicle(id: string): Promise<Record<string, unknown>>;
  assignVehicle(id: string, driverId: string): Promise<Record<string, unknown>>;
  scheduleVehicleMaintenance(id: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;

  getSettings(): Promise<Record<string, unknown>>;
  updateSetting(key: string, value: unknown): Promise<Record<string, unknown>>;
  getNotificationRules(): Promise<Record<string, unknown>>;
  updateNotificationRules(input: Record<string, unknown>): Promise<Record<string, unknown>>;

  getMe(): Promise<Record<string, unknown>>;
  updateMe(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  changeMyPassword(input: { current_password: string; new_password: string }): Promise<Record<string, unknown>>;
  toggleMyTwoFactor(enabled: boolean): Promise<Record<string, unknown>>;
  listMySessions(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  revokeMySession(id: string): Promise<Record<string, unknown>>;
  listMyActivityLog(params?: Record<string, unknown>): Promise<Record<string, unknown>>;

  listCorporateOrganizations(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  createCorporateOrganization(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateCorporateOrganization(id: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateCorporateOrganizationStatus(id: string, status: string): Promise<Record<string, unknown>>;
  generateCorporateInvoice(id: string, input?: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateCorporatePolicy(id: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;

  createEvent(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  listEvents(params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateEvent(id: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateEventStatus(id: string, status: string): Promise<Record<string, unknown>>;

  processSettlements(): Promise<Record<string, unknown>>;
}

export const createAdminApi = (http: HttpClient): AdminApi => {
  return {
    listRoles() {
      return http.get('/admin/roles');
    },

    updateRole(role, permissions) {
      return http.put(`/admin/roles/${role}`, { permissions });
    },

    getDashboard() {
      return http.get('/admin/dashboard');
    },

    getDashboardLive() {
      return http.get('/admin/dashboard/live');
    },

    listUsers(params) {
      return http.get('/admin/users', withQuery(undefined, params ?? {}));
    },

    getUserById(id) {
      return http.get(`/admin/users/${id}`);
    },

    verifyUser(id) {
      return http.patch(`/admin/users/${id}/verify`);
    },

    suspendUser(id, reason) {
      return http.patch(`/admin/users/${id}/suspend`, reason ? { reason } : {});
    },

    activateUser(id) {
      return http.patch(`/admin/users/${id}/activate`);
    },

    deactivateUser(id) {
      return http.delete(`/admin/users/${id}`);
    },

    listUserTrips(id, params) {
      return http.get(`/admin/users/${id}/trips`, withQuery(undefined, params ?? {}));
    },

    listDrivers(params) {
      return http.get('/admin/drivers', withQuery(undefined, params ?? {}));
    },

    getDriverById(id) {
      return http.get(`/admin/drivers/${id}`);
    },

    verifyDriver(id, approved, reason) {
      return http.patch(`/admin/drivers/${id}/verify`, {
        decision: approved ? 'approve' : 'reject',
        reason
      });
    },

    suspendDriver(id, reason) {
      return http.patch(`/admin/drivers/${id}/suspend`, { reason });
    },

    messageDriver(id, title, body, data) {
      return http.post(`/admin/drivers/${id}/message`, {
        title,
        body,
        data
      });
    },

    listBookings(params) {
      return http.get('/admin/bookings', withQuery(undefined, params ?? {}));
    },

    assignDriverToBooking(id, driverId) {
      return http.patch(`/admin/bookings/${id}/assign-driver`, {
        driver_id: driverId
      });
    },

    cancelBooking(id, reason, refund) {
      return http.patch(`/admin/bookings/${id}/cancel`, {
        reason,
        refund
      });
    },

    listVehicles(params) {
      return http.get('/admin/vehicles', withQuery(undefined, params ?? {}));
    },

    createVehicle(input) {
      return http.post('/admin/vehicles', input);
    },

    updateVehicle(id, input) {
      return http.put(`/admin/vehicles/${id}`, input);
    },

    deleteVehicle(id) {
      return http.delete(`/admin/vehicles/${id}`);
    },

    assignVehicle(id, driverId) {
      return http.patch(`/admin/vehicles/${id}/assign`, {
        driver_id: driverId
      });
    },

    scheduleVehicleMaintenance(id, input) {
      return http.patch(`/admin/vehicles/${id}/maintenance`, input);
    },

    getSettings() {
      return http.get('/admin/settings');
    },

    updateSetting(key, value) {
      return http.put(`/admin/settings/${key}`, { value });
    },

    getNotificationRules() {
      return http.get('/admin/settings/notifications');
    },

    updateNotificationRules(input) {
      return http.put('/admin/settings/notifications', input);
    },

    getMe() {
      return http.get('/admin/me');
    },

    updateMe(input) {
      return http.put('/admin/me', input);
    },

    changeMyPassword(input) {
      return http.put('/admin/me/password', input);
    },

    toggleMyTwoFactor(enabled) {
      return http.patch('/admin/me/2fa', { enabled });
    },

    listMySessions(params) {
      return http.get('/admin/me/sessions', withQuery(undefined, params ?? {}));
    },

    revokeMySession(id) {
      return http.delete(`/admin/me/sessions/${id}`);
    },

    listMyActivityLog(params) {
      return http.get('/admin/me/activity-log', withQuery(undefined, params ?? {}));
    },

    listCorporateOrganizations(params) {
      return http.get('/admin/corporate', withQuery(undefined, params ?? {}));
    },

    createCorporateOrganization(input) {
      return http.post('/admin/corporate', input);
    },

    updateCorporateOrganization(id, input) {
      return http.put(`/admin/corporate/${id}`, input);
    },

    updateCorporateOrganizationStatus(id, status) {
      return http.patch(`/admin/corporate/${id}/status`, { status });
    },

    generateCorporateInvoice(id, input) {
      return http.post(`/admin/corporate/${id}/generate-invoice`, input ?? {});
    },

    updateCorporatePolicy(id, input) {
      return http.put(`/admin/corporate/${id}/policy`, input);
    },

    createEvent(input) {
      return http.post('/admin/events', input);
    },

    listEvents(params) {
      return http.get('/admin/events', withQuery(undefined, params ?? {}));
    },

    updateEvent(id, input) {
      return http.put(`/admin/events/${id}`, input);
    },

    updateEventStatus(id, status) {
      return http.patch(`/admin/events/${id}/status`, { status });
    },

    processSettlements() {
      return http.post('/admin/settlements/process');
    }
  };
};
