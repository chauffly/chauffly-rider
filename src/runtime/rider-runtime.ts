import {
  ChaufflySocketClient,
  MemoryTokenStorage,
  createAsyncStorageTokenStorage,
  createChaufflyApiClient,
  createDefaultQueryClient,
  createSecureStoreTokenStorage,
  queryKeys
} from '@/api-client';
import { env } from '@/config/env';
import { accountRoleService } from '@/services/account-role';

const buildRequestId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const initializeTokenStorage = () => {
  try {
    // Keep SecureStore as primary persistence when native module is available.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const secureStore = require('expo-secure-store') as {
      getItemAsync?: (key: string) => Promise<string | null>;
      setItemAsync?: (key: string, value: string) => Promise<void>;
      deleteItemAsync?: (key: string) => Promise<void>;
    };

    if (
      typeof secureStore.getItemAsync === 'function' &&
      typeof secureStore.setItemAsync === 'function' &&
      typeof secureStore.deleteItemAsync === 'function'
    ) {
      return createSecureStoreTokenStorage({
        getItemAsync: secureStore.getItemAsync,
        setItemAsync: secureStore.setItemAsync,
        deleteItemAsync: secureStore.deleteItemAsync
      });
    }
  } catch {
    // Fall through to AsyncStorage for simulators/builds missing SecureStore.
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asyncStorageModule = require('@react-native-async-storage/async-storage') as {
      default?: {
        getItem?: (key: string) => Promise<string | null>;
        setItem?: (key: string, value: string) => Promise<void>;
        removeItem?: (key: string) => Promise<void>;
      };
    };
    const asyncStorage = asyncStorageModule.default;

    if (
      asyncStorage &&
      typeof asyncStorage.getItem === 'function' &&
      typeof asyncStorage.setItem === 'function' &&
      typeof asyncStorage.removeItem === 'function'
    ) {
      return createAsyncStorageTokenStorage({
        getItem: asyncStorage.getItem.bind(asyncStorage),
        setItem: asyncStorage.setItem.bind(asyncStorage),
        removeItem: asyncStorage.removeItem.bind(asyncStorage),
      });
    }
  } catch {
    // Fall through to memory storage.
  }

  return new MemoryTokenStorage();
};

export const tokenStorage = initializeTokenStorage();

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
  await accountRoleService.clearRole();
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
