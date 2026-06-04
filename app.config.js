// The Expo dev client always bundles in development mode, so production values
// in .env.production never reach the JS bundle's EXPO_PUBLIC_* virtual env.
// When APP_ENV=production (see `start:prod`), load .env.production here and
// expose the values via `extra`, which the app reads at runtime regardless of
// the bundler's dev/prod mode.
if (process.env.APP_ENV === 'production') {
  require('dotenv').config({ path: '.env.production', override: true });
}

module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    }
  },
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    }
  },
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    apiPrefix: process.env.EXPO_PUBLIC_API_PREFIX,
    socketBaseUrl: process.env.EXPO_PUBLIC_SOCKET_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL,
    socketPath: process.env.EXPO_PUBLIC_SOCKET_PATH,
    requestTimeoutMs: process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS,
    enableApiLogs: process.env.EXPO_PUBLIC_ENABLE_API_LOGS,
    enableSocketDebug: process.env.EXPO_PUBLIC_ENABLE_SOCKET_DEBUG,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY
  }
});
