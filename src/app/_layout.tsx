import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/context/theme-context';
import { LanguageProvider } from '@/context/language-context';
import { LocationProvider } from '@/context/location-context';
import { StartupProvider, useStartup } from '@/context/startup-context';
import { RiderRuntimeProvider } from '@/runtime/rider-runtime-provider';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { LaunchOverlay } from '@/components/common/launch-overlay';
import { ForceUpdateGate } from '@/components/force-update-gate';
import { useOtaUpdates } from '@/hooks/use-ota-updates';

SplashScreen.preventAutoHideAsync();

// Minimum time the branded overlay stays up, so a fast cold start still reads as
// an intentional splash rather than a flash.
const MIN_LAUNCH_OVERLAY_MS = 1400;
// Hard ceiling: never trap the user behind the overlay if a startup gate stalls.
const MAX_LAUNCH_OVERLAY_MS = 8000;

export default function RootLayout() {
  return (
    <StartupProvider>
      <RootLayoutBoot />
    </StartupProvider>
  );
}

function RootLayoutBoot() {
  const { isRouteResolved } = useStartup();
  const [showLaunchOverlay, setShowLaunchOverlay] = useState(true);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [overlayImageLoaded, setOverlayImageLoaded] = useState(false);
  const [bootStartedAt] = useState(() => Date.now());
  const [fontsLoaded, fontError] = useFonts({
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  useOtaUpdates();

  const fontsReady = fontsLoaded || fontError;

  // Hand the screen from the native splash to the JS overlay only once the
  // overlay's logo has actually decoded, so the gold mark never blinks to a bare
  // background mid-handoff. The overlay mirrors the native splash pixel-for-pixel.
  useEffect(() => {
    if (overlayImageLoaded && !nativeSplashHidden) {
      SplashScreen.hideAsync().finally(() => {
        setNativeSplashHidden(true);
      });
    }
  }, [overlayImageLoaded, nativeSplashHidden]);

  // Dismiss the overlay only when the app is truly ready: fonts loaded, the
  // initial route resolved, and the native splash already handed off — then
  // honour the minimum brand time.
  useEffect(() => {
    if (fontsReady && isRouteResolved && nativeSplashHidden) {
      const elapsed = Date.now() - bootStartedAt;
      const remaining = Math.max(MIN_LAUNCH_OVERLAY_MS - elapsed, 0);
      const timeout = setTimeout(() => setShowLaunchOverlay(false), remaining);
      return () => clearTimeout(timeout);
    }
  }, [bootStartedAt, fontsReady, isRouteResolved, nativeSplashHidden]);

  // Safety net: force the overlay down if any gate never settles.
  useEffect(() => {
    const ceiling = setTimeout(() => setShowLaunchOverlay(false), MAX_LAUNCH_OVERLAY_MS);
    return () => clearTimeout(ceiling);
  }, []);

  return (
    <>
      <ForceUpdateGate>
        <ThemeProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <RiderRuntimeProvider>
                <LocationProvider>
                  <RootLayoutNav />
                </LocationProvider>
              </RiderRuntimeProvider>
            </ErrorBoundary>
          </LanguageProvider>
        </ThemeProvider>
      </ForceUpdateGate>
      <LaunchOverlay visible={showLaunchOverlay} onImageLoaded={() => setOverlayImageLoaded(true)} />
    </>
  );
}

function RootLayoutNav() {
  const { isDark, colors } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="your-route" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="account/saved-addresses" options={{ headerShown: false }} />
        <Stack.Screen name="account/notifications" options={{ headerShown: false }} />
        <Stack.Screen name="account/notification-list" options={{ headerShown: false }} />
        <Stack.Screen name="account/appearance" options={{ headerShown: false }} />
        <Stack.Screen name="account/personal-info" options={{ headerShown: false }} />
        <Stack.Screen name="account/security" options={{ headerShown: false }} />
        <Stack.Screen name="account/top-up" options={{ headerShown: false }} />
        <Stack.Screen name="account/help-support" options={{ headerShown: false }} />
        <Stack.Screen name="account/help-faq" options={{ headerShown: false }} />
        <Stack.Screen name="account/contact-support" options={{ headerShown: false }} />
        <Stack.Screen name="account/privacy-policy" options={{ headerShown: false }} />
        <Stack.Screen name="account/terms-of-use" options={{ headerShown: false }} />
        <Stack.Screen name="account/visit-website" options={{ headerShown: false }} />
        <Stack.Screen name="account/join-company" options={{ headerShown: false }} />
        <Stack.Screen name="account/document-verification" options={{ headerShown: false }} />
        <Stack.Screen name="account/travel-limit" options={{ headerShown: false }} />
        <Stack.Screen name="corporate" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style={colors.statusBar as "light" | "dark"} />
    </NavigationThemeProvider>
  );
}
