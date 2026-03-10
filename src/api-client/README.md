# Chauffly API Client

Shared API client layer for Chauffly rider app, driver app, and admin dashboard.

## Features

- Axios transport with:
  - JWT auth header attachment
  - Auto refresh on `401` with single refresh queue
  - Network retry (max 3, exponential backoff)
  - Optional request/response debug logs
- Typed API modules:
  - `authApi`, `usersApi`, `bookingApi`, `driverApi`, `rideOptionsApi`, `chatApi`, `walletApi`
  - `corporateApi`, `adminApi`, `analyticsApi`, `safetyApi`
- React Query integration:
  - prebuilt hooks (`useCurrentUser`, `useActiveBooking`, `useRideOptions`, `useDriverEarnings`, `useNearbyDrivers`, etc.)
  - cache invalidation on key mutations
- Socket.IO wrapper:
  - namespaces: `/rides`, `/chat`, `/admin`
  - JWT handshake auth
  - reconnection backoff
  - typed events + React hooks
- `localJsonApi` compatibility adapter for gradual migration.

## Quick Start (React Native)

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChaufflyApiProvider,
  ChaufflySocketClient,
  createAsyncStorageTokenStorage,
  createChaufflyApiClient,
  createDefaultQueryClient
} from '@/api-client';

const tokenStorage = createAsyncStorageTokenStorage(AsyncStorage);

const apiClient = createChaufflyApiClient({
  baseURL: 'https://api.chauffly.com',
  tokenStorage,
  enableLogging: __DEV__,
  onAuthFailure: async () => {
    // route to login screen
  }
});

const socketClient = new ChaufflySocketClient({
  socketBaseUrl: 'https://api.chauffly.com',
  getAccessToken: async () => (await tokenStorage.getTokens())?.accessToken ?? null,
  enableDebugLogs: __DEV__
});

const queryClient = createDefaultQueryClient();
```

Then wrap app root:

```tsx
<ChaufflyApiProvider apiClient={apiClient} queryClient={queryClient}>
  <App />
</ChaufflyApiProvider>
```

## Secure Storage (recommended)

Use `createSecureStoreTokenStorage` with an Expo SecureStore adapter.

```ts
import * as SecureStore from 'expo-secure-store';
import { createSecureStoreTokenStorage } from '@/api-client';

const tokenStorage = createSecureStoreTokenStorage({
  getItemAsync: SecureStore.getItemAsync,
  setItemAsync: SecureStore.setItemAsync,
  deleteItemAsync: SecureStore.deleteItemAsync
});
```

## Socket Lifecycle

- On successful login/OTP verification:
  - persist tokens via `apiClient.session.setTokens(...)`
  - call `socketClient.connectAll()`
- On logout/session expiry:
  - call `socketClient.disconnectAll()`
  - clear tokens via `apiClient.session.clear()`

## Migration Guide

See `INTEGRATION_GUIDE.md` for:

- Rider/Driver/Admin step-by-step integration checklist
- `localJsonApi` method mapping table
- data-shape compatibility notes
