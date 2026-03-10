import { ApiClientError, createHttpClient, HttpClient, HttpClientOptions } from './http';
import { createAuthApi, AuthApi } from './apis/auth-api';
import { createBookingsApi, BookingsApi } from './apis/bookings-api';
import { createDriversApi, DriversApi } from './apis/drivers-api';
import { createRideOptionsApi, RideOptionsApi } from './apis/ride-options-api';
import { createUsersApi, UsersApi } from './apis/users-api';
import { createChatApi, ChatApi } from './apis/chat-api';
import { createWalletApi, WalletApi } from './apis/wallet-api';
import { createCorporateApi, CorporateApi } from './apis/corporate-api';
import { createAdminApi, AdminApi } from './apis/admin-api';
import { createAnalyticsApi, AnalyticsApi } from './apis/analytics-api';
import { createSafetyApi, SafetyApi } from './apis/safety-api';
import { AuthTokens } from './types';

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
