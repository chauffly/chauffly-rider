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

export const env = {
  apiBaseUrl: trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'),
  apiPrefix: process.env.EXPO_PUBLIC_API_PREFIX ?? '/api/v1',
  socketBaseUrl: trimTrailingSlash(
    process.env.EXPO_PUBLIC_SOCKET_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'
  ),
  socketPath: process.env.EXPO_PUBLIC_SOCKET_PATH ?? '/socket.io',
  requestTimeoutMs: parseNumber(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, 15_000),
  enableApiLogs: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_API_LOGS, false),
  enableSocketDebug: parseBoolean(process.env.EXPO_PUBLIC_ENABLE_SOCKET_DEBUG, false),
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? ''
} as const;

export type AppEnv = typeof env;
