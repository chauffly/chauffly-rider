import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { tokenStorage } from '@/runtime/rider-runtime';
import { RiderOnboardingRoute, riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';
import { useStartup } from '@/context/startup-context';

export default function Index() {
  const { markRouteResolved } = useStartup();
  const [targetRoute, setTargetRoute] = useState<'/(auth)/login' | '/(tabs)' | RiderOnboardingRoute | null>(null);

  // Terminal destinations (login / onboarding) are ready as soon as they resolve.
  // The /(tabs) path has a second gate in (tabs)/_layout that signals readiness,
  // so we keep the splash up until that one settles.
  useEffect(() => {
    if (targetRoute && targetRoute !== '/(tabs)') {
      markRouteResolved();
    }
  }, [targetRoute, markRouteResolved]);

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
