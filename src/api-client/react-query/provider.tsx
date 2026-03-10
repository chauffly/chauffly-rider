import React, { createContext, PropsWithChildren, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChaufflyApiClient } from '../client';

const ApiClientContext = createContext<ChaufflyApiClient | null>(null);

export const createDefaultQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: 0
      }
    }
  });
};

export interface ApiProviderProps {
  apiClient: ChaufflyApiClient;
  queryClient?: QueryClient;
}

export const ChaufflyApiProvider = ({
  apiClient,
  queryClient,
  children
}: PropsWithChildren<ApiProviderProps>): React.JSX.Element => {
  const internalQueryClient = React.useMemo(() => queryClient ?? createDefaultQueryClient(), [queryClient]);

  return (
    <ApiClientContext.Provider value={apiClient}>
      <QueryClientProvider client={internalQueryClient}>{children}</QueryClientProvider>
    </ApiClientContext.Provider>
  );
};

export const useApiClient = (): ChaufflyApiClient => {
  const client = useContext(ApiClientContext);

  if (!client) {
    throw new Error('useApiClient must be used inside ChaufflyApiProvider.');
  }

  return client;
};
