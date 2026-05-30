import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { router, Stack } from "expo-router";
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
import { RiderRuntimeProvider } from '@/runtime/rider-runtime-provider';
import { ErrorBoundary } from '@/components/common/error-boundary';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
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
