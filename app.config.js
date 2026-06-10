// The Expo dev client always bundles in development mode, so production values
// in .env.production never reach the JS bundle's EXPO_PUBLIC_* virtual env.
// When APP_ENV=production (see `start:prod`), load .env.production here and
// expose the values via `extra`, which the app reads at runtime regardless of
// the bundler's dev/prod mode.
if (process.env.APP_ENV === 'production') {
  require('dotenv').config({ path: '.env.production', override: true });
}

const normalizeGoogleMapsApiKey = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  const keyStart = trimmed.indexOf('AIza');
  return keyStart >= 0 ? trimmed.slice(keyStart) : trimmed;
};

const GOOGLE_MAPS_API_KEY = normalizeGoogleMapsApiKey(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      // Native splash is intentionally just the dark #04070F background — its
      // image is a transparent pixel, so no logo/icon ever flashes before the
      // full splash. The full-screen branded splash (<LaunchOverlay /> in
      // src/app/_layout.tsx, assets/images/full-splash-image.png) renders on top
      // of that same background as the first visible frame; SplashScreen.hideAsync()
      // is gated on that image decoding, so the handoff is seamless and the user
      // perceives the full splash appearing immediately on launch.
      // NOTE: the native splashscreen_logo drawables under android/.../res are
      // also overwritten with this transparent pixel so a non-prebuild gradle
      // build shows no logo. Re-run prebuild if regenerating native from scratch.
      'expo-splash-screen',
      {
        image: './assets/images/transparent-splash.png',
        resizeMode: 'contain',
        backgroundColor: '#04070F',
        dark: {
          image: './assets/images/transparent-splash.png',
          backgroundColor: '#04070F',
        },
      },
    ],
    'expo-font',
    'expo-localization',
    'expo-secure-store',
    'expo-web-browser',
    '@react-native-community/datetimepicker'
  ],
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY
    }
  },
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY
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
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY
  }
});
