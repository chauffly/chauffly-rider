import Constants from 'expo-constants';

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

// Values injected by app.config.js `extra` take precedence so that production
// config (loaded from .env.production when APP_ENV=production) reaches the app
// even though the dev client always bundles EXPO_PUBLIC_* in development mode.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const env = {
  apiBaseUrl: trimTrailingSlash(
    extra.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'
  ),
  apiPrefix: extra.apiPrefix ?? process.env.EXPO_PUBLIC_API_PREFIX ?? '/api/v1',
  socketBaseUrl: trimTrailingSlash(
    extra.socketBaseUrl ??
      process.env.EXPO_PUBLIC_SOCKET_BASE_URL ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      'http://localhost:4000'
  ),
  socketPath: extra.socketPath ?? process.env.EXPO_PUBLIC_SOCKET_PATH ?? '/socket.io',
  requestTimeoutMs: parseNumber(extra.requestTimeoutMs ?? process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, 60_000),
  enableApiLogs: parseBoolean(extra.enableApiLogs ?? process.env.EXPO_PUBLIC_ENABLE_API_LOGS, false),
  enableSocketDebug: parseBoolean(extra.enableSocketDebug ?? process.env.EXPO_PUBLIC_ENABLE_SOCKET_DEBUG, false),
  googleMapsApiKey: extra.googleMapsApiKey ?? process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  paystackPublicKey: extra.paystackPublicKey ?? process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? ''
} as const;

export type AppEnv = typeof env;
