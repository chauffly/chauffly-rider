import * as SecureStore from 'expo-secure-store';

import {
  ChaufflySocketClient,
  createChaufflyApiClient,
  createDefaultQueryClient,
  createSecureStoreTokenStorage,
  queryKeys
} from '@/api-client';
import { env } from '@/config/env';

const buildRequestId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const tokenStorage = createSecureStoreTokenStorage({
  getItemAsync: SecureStore.getItemAsync,
  setItemAsync: SecureStore.setItemAsync,
  deleteItemAsync: SecureStore.deleteItemAsync
});

export const queryClient = createDefaultQueryClient();

export const socketClient = new ChaufflySocketClient({
  socketBaseUrl: env.socketBaseUrl,
  socketPath: env.socketPath,
  getAccessToken: async () => (await tokenStorage.getTokens())?.accessToken ?? null,
  enableDebugLogs: env.enableSocketDebug
});

const clearRuntimeState = async (): Promise<void> => {
  socketClient.disconnectAll();
  await tokenStorage.clearTokens();
  queryClient.clear();
};

export const apiClient = createChaufflyApiClient({
  baseURL: env.apiBaseUrl,
  apiPrefix: env.apiPrefix,
  timeoutMs: env.requestTimeoutMs,
  tokenStorage,
  enableLogging: env.enableApiLogs,
  getRequestId: buildRequestId,
  onTokensUpdated: async () => {
    await socketClient.connectRides();
    await socketClient.connectChat();
  },
  onAuthFailure: async () => {
    await clearRuntimeState();
  }
});

const invalidateRiderLiveData = (): void => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.active });
  void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.users.notifications() });
};

socketClient.onRideEvent('driver_assigned', invalidateRiderLiveData);
socketClient.onRideEvent('driver_location_update', invalidateRiderLiveData);
socketClient.onRideEvent('driver_arrived', invalidateRiderLiveData);
socketClient.onRideEvent('trip_started', invalidateRiderLiveData);
socketClient.onRideEvent('trip_completed', invalidateRiderLiveData);
socketClient.onRideEvent('booking_status_changed', invalidateRiderLiveData);
socketClient.onRideEvent('no_drivers_available', invalidateRiderLiveData);
socketClient.onRideEvent('ride_cancelled', invalidateRiderLiveData);

export const connectRiderSockets = async (): Promise<void> => {
  await socketClient.connectRides();
  await socketClient.connectChat();
};

export const disconnectRiderSockets = (): void => {
  socketClient.disconnectAll();
};

export const clearRiderSession = async (): Promise<void> => {
  await clearRuntimeState();
};
