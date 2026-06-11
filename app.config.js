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
      // The native splash IS the full branded splash image (full-bleed via
      // resizeMode 'cover'), so the very first frame the OS paints on launch is
      // already the full splash — no logo flash and no dark gap/lag before it.
      // <LaunchOverlay /> (src/app/_layout.tsx) then renders the same
      // full-splash-image.png on top for a seamless handoff and holds it for the
      // brand-minimum time before fading into the app.
      // NOTE on Android 12+: the OS system splash can only center an icon (it has
      // no true full-bleed mode), so there it shows the image centered on #04070F
      // and the JS overlay fills the screen; iOS and Android <=11 are full-bleed
      // immediately.
      'expo-splash-screen',
      {
        image: './assets/images/full-splash-image.png',
        resizeMode: 'cover',
        backgroundColor: '#04070F',
        dark: {
          image: './assets/images/full-splash-image.png',
          backgroundColor: '#04070F',
        },
      },
    ],
    // Must come after expo-splash-screen: paints the full splash as the native
    // windowBackground, blanks the Android 12+ system-splash icon, drops x86 ABIs.
    './plugins/withChaufflyAndroid',
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
