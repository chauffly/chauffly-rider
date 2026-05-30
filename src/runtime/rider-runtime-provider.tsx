import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { ChaufflyApiProvider } from '@/api-client';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { apiClient, connectRiderSockets, queryClient, tokenStorage } from '@/runtime/rider-runtime';

const PushTokenRegistrar = (): null => {
  const handleToken = useCallback((token: string) => {
    apiClient.usersApi.registerPushToken(token).catch(() => {});
  }, []);
  usePushNotifications(handleToken);
  return null;
};

export const RiderRuntimeProvider = ({ children }: PropsWithChildren): React.JSX.Element | null => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const bootstrap = async (): Promise<void> => {
      try {
        const tokens = await tokenStorage.getTokens();
        if (tokens?.accessToken) {
          await connectRiderSockets();
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <ChaufflyApiProvider apiClient={apiClient} queryClient={queryClient}>
      <PushTokenRegistrar />
      {children}
    </ChaufflyApiProvider>
  );
};
