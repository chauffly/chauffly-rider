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

// Pick the first value that is actually set. Crucially this skips EMPTY strings,
// not just null/undefined. An OTA update published without the production env
// serialises e.g. `extra.googleMapsApiKey` as "" (app.config normalises a missing
// key to ""), and `"" ?? fallback` keeps the "" — which silently dropped the map
// on the second launch (after the embedded build is replaced by that update).
// Falling through to the EXPO_PUBLIC_* value (inlined into the JS bundle) recovers
// it, the same path the API base URL already relied on.
const pick = (...values: (string | undefined)[]): string | undefined =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0);

export const env = {
  apiBaseUrl: trimTrailingSlash(
    pick(extra.apiBaseUrl, process.env.EXPO_PUBLIC_API_BASE_URL) ?? 'http://localhost:4000'
  ),
  apiPrefix: pick(extra.apiPrefix, process.env.EXPO_PUBLIC_API_PREFIX) ?? '/api/v1',
  socketBaseUrl: trimTrailingSlash(
    pick(
      extra.socketBaseUrl,
      process.env.EXPO_PUBLIC_SOCKET_BASE_URL,
      process.env.EXPO_PUBLIC_API_BASE_URL
    ) ?? 'http://localhost:4000'
  ),
  socketPath: pick(extra.socketPath, process.env.EXPO_PUBLIC_SOCKET_PATH) ?? '/socket.io',
  requestTimeoutMs: parseNumber(
    pick(extra.requestTimeoutMs, process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS),
    60_000
  ),
  enableApiLogs: parseBoolean(pick(extra.enableApiLogs, process.env.EXPO_PUBLIC_ENABLE_API_LOGS), false),
  enableSocketDebug: parseBoolean(
    pick(extra.enableSocketDebug, process.env.EXPO_PUBLIC_ENABLE_SOCKET_DEBUG),
    false
  ),
  googleMapsApiKey: pick(extra.googleMapsApiKey, process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) ?? '',
  paystackPublicKey: pick(extra.paystackPublicKey, process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY) ?? ''
} as const;

export type AppEnv = typeof env;
