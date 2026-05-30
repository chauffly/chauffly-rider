import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { tokenStorage } from '@/runtime/rider-runtime';
import { RiderOnboardingRoute, riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';

export default function Index() {
  const [targetRoute, setTargetRoute] = useState<'/(auth)/login' | '/(tabs)' | RiderOnboardingRoute | null>(null);

  useEffect(() => {
    const resolveInitialRoute = async () => {
      try {
        const tokens = await tokenStorage.getTokens();
        if (!tokens?.accessToken) {
          setTargetRoute('/(auth)/login');
          return;
        }

        const pendingOnboardingRoute = await riderOnboardingProgressStorage.getPendingRoute();
        if (pendingOnboardingRoute) {
          setTargetRoute(pendingOnboardingRoute);
          return;
        }
      } catch {
        setTargetRoute('/(auth)/login');
        return;
      }

      setTargetRoute('/(tabs)');
    };

    void resolveInitialRoute();
  }, []);

  if (!targetRoute) {
    return null;
  }

  return <Redirect href={targetRoute} />;
}
