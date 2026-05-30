import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import { NativeModules, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const PROJECT_ID = '1b9de393-5c2f-4c5e-8885-a4187c49d09e';

// Guard: if the native module isn't linked yet, skip everything silently.
const isNativeModuleAvailable = () =>
  Boolean(NativeModules.ExpoPushTokenManager) ||
  Boolean((global as Record<string, unknown>).__ExpoNotificationsNativeModule);

export const usePushNotifications = (
  onTokenReady: (token: string) => void
): void => {
  const router = useRouter();
  const tokenSentRef = useRef(false);

  useEffect(() => {
    if (!Device.isDevice || !isNativeModuleAvailable()) return;

    const run = async () => {
      // Dynamic import so Metro can still bundle without the module crashing
      const Notifications = await import('expo-notifications');

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true
        })
      });

      const existing = (await Notifications.getPermissionsAsync()) as { granted?: boolean };
      let granted = Boolean(existing.granted);
      if (!granted) {
        const requested = (await Notifications.requestPermissionsAsync()) as { granted?: boolean };
        granted = Boolean(requested.granted);
      }
      if (!granted) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('ride-updates', {
          name: 'Ride Updates',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default'
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
      if (!tokenSentRef.current) {
        tokenSentRef.current = true;
        onTokenReady(tokenData.data);
      }
    };

    run().catch(() => {});
  }, [onTokenReady]);

  useEffect(() => {
    if (!isNativeModuleAvailable()) return;

    let subscription: { remove(): void } | null = null;

    import('expo-notifications').then((Notifications) => {
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<string, string> | undefined;
        const bookingId = data?.booking_id;
        const event = data?.event;

        if (!bookingId) return;

        if (event === 'driver_assigned' || event === 'rider_started_scheduled_ride') {
          router.push({ pathname: '/booking/driver-accepts', params: { bookingId } });
        } else if (event === 'scheduled_ride_reminder' || event === 'scheduled_ride_5min_reminder') {
          router.push({ pathname: '/booking/schedule-detail', params: { bookingId } });
        }
      });
    }).catch(() => {});

    return () => { subscription?.remove(); };
  }, [router]);
};
