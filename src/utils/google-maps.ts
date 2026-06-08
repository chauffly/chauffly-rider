import { env } from '@/config/env';

const GOOGLE_MAPS_ANDROID_KEY_PREFIX = 'AIza';

// True when the native build was compiled with a Google Maps API key. MapView
// crashes on mount when the native manifest has no key, so screens fall back to
// <MapUnavailable /> while this is false. The key is injected into the native
// AndroidManifest (and surfaced here via app.config.js `extra`) from
// EXPO_PUBLIC_GOOGLE_MAPS_API_KEY at build time, so checking it here mirrors the
// native build state on both platforms.
export const hasConfiguredAndroidGoogleMapsKey =
  env.googleMapsApiKey.trim().startsWith(GOOGLE_MAPS_ANDROID_KEY_PREFIX);
