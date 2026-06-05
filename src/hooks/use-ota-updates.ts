import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Silently checks for and downloads OTA (JS) updates on launch and whenever the
 * app returns to the foreground. Downloaded updates apply on the NEXT cold start
 * (we never call reloadAsync here) so an active ride/booking is not interrupted.
 * No-ops in development and when updates are disabled (e.g. Expo Go).
 */
export function useOtaUpdates(): void {
  useEffect(() => {
    const checkForUpdate = async (): Promise<void> => {
      if (__DEV__ || !Updates.isEnabled) {
        return;
      }

      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch {
        // Best-effort: ignore update errors so the app keeps running.
      }
    };

    void checkForUpdate();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, []);
}
