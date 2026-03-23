import { ApiClientError, createHttpClient } from './http';
import type { HttpClient, HttpClientOptions } from './http';
import { createAuthApi } from './apis/auth-api';
import type { AuthApi } from './apis/auth-api';
import { createBookingsApi } from './apis/bookings-api';
import type { BookingsApi } from './apis/bookings-api';
import { createDriversApi } from './apis/drivers-api';
import type { DriversApi } from './apis/drivers-api';
import { createRideOptionsApi } from './apis/ride-options-api';
import type { RideOptionsApi } from './apis/ride-options-api';
import { createUsersApi } from './apis/users-api';
import type { UsersApi } from './apis/users-api';
import { createChatApi } from './apis/chat-api';
import type { ChatApi } from './apis/chat-api';
import { createWalletApi } from './apis/wallet-api';
import type { WalletApi } from './apis/wallet-api';
import { createCorporateApi } from './apis/corporate-api';
import type { CorporateApi } from './apis/corporate-api';
import { createAdminApi } from './apis/admin-api';
import type { AdminApi } from './apis/admin-api';
import { createAnalyticsApi } from './apis/analytics-api';
import type { AnalyticsApi } from './apis/analytics-api';
import { createSafetyApi } from './apis/safety-api';
import type { SafetyApi } from './apis/safety-api';
import type { AuthTokens } from './types';

export interface ChaufflyApiClient {
  http: HttpClient;
  authApi: AuthApi;
  usersApi: UsersApi;
  bookingApi: BookingsApi;
  driverApi: DriversApi;
  rideOptionsApi: RideOptionsApi;
  chatApi: ChatApi;
  walletApi: WalletApi;
  corporateApi: CorporateApi;
  adminApi: AdminApi;
  analyticsApi: AnalyticsApi;
  safetyApi: SafetyApi;
  session: {
    getTokens(): Promise<AuthTokens | null>;
    setTokens(tokens: AuthTokens): Promise<void>;
    clear(): Promise<void>;
  };
}

export type CreateChaufflyApiClientOptions = HttpClientOptions;

export const createChaufflyApiClient = (
  options: CreateChaufflyApiClientOptions
): ChaufflyApiClient => {
  const http = createHttpClient(options);

  return {
    http,
    authApi: createAuthApi(http),
    usersApi: createUsersApi(http),
    bookingApi: createBookingsApi(http),
    driverApi: createDriversApi(http),
    rideOptionsApi: createRideOptionsApi(http),
    chatApi: createChatApi(http),
    walletApi: createWalletApi(http),
    corporateApi: createCorporateApi(http),
    adminApi: createAdminApi(http),
    analyticsApi: createAnalyticsApi(http),
    safetyApi: createSafetyApi(http),
    session: {
      getTokens: () => options.tokenStorage.getTokens(),
      setTokens: (tokens) => options.tokenStorage.setTokens(tokens),
      clear: () => options.tokenStorage.clearTokens()
    }
  };
};

export { ApiClientError };
