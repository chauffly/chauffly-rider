import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { useApiClient } from './provider';
import { queryKeys } from './query-keys';
import {
  BookingCreateInput,
  BookingEstimateInput,
  BookingTab,
  DriverLocationUpdateInput,
  NearbyDriversInput,
  PaginatedResponse,
  AuthSession
} from '../types';

export const useCurrentUser = (
  options?: Omit<UseQueryOptions<Record<string, unknown>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => api.usersApi.getCurrentUser(),
    ...options
  });
};

export const useRideOptions = (
  options?: Omit<UseQueryOptions<Array<Record<string, unknown>>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.rideOptions.all,
    queryFn: () => api.rideOptionsApi.list(),
    ...options
  });
};

export const useActiveBooking = (
  options?: Omit<UseQueryOptions<Record<string, unknown> | null>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.bookings.active,
    queryFn: () => api.bookingApi.getActive(),
    ...options
  });
};

export const useBookings = (
  params?: { tab?: BookingTab; cursor?: string; limit?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Record<string, unknown>>>,
    'queryKey' | 'queryFn'
  >
) => {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.bookings.list(params?.tab, params?.cursor),
    queryFn: () => api.bookingApi.list(params),
    ...options
  });
};

export const useDriverEarnings = (
  period: '1d' | '1w' | '1m' | '1y',
  options?: Omit<UseQueryOptions<Record<string, unknown>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.drivers.earnings(period),
    queryFn: () => api.driverApi.getEarnings(period),
    ...options
  });
};

export const useNearbyDrivers = (
  input: NearbyDriversInput,
  options?: Omit<UseQueryOptions<Array<Record<string, unknown>>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  const key = `${input.latitude}:${input.longitude}:${input.radius_km}:${input.tier ?? 'all'}`;

  return useQuery({
    queryKey: queryKeys.drivers.nearby(key),
    queryFn: () => api.driverApi.nearby(input),
    ...options
  });
};

export const useWalletBalance = (
  options?: Omit<UseQueryOptions<{ available_balance: number; ledger_balance: number; currency: string }>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.wallet.balance,
    queryFn: () => api.walletApi.getBalance(),
    ...options
  });
};

export const useChatMessages = (
  bookingId: string,
  params?: { cursor?: string; limit?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Record<string, unknown>>>,
    'queryKey' | 'queryFn'
  >
) => {
  const api = useApiClient();

  return useQuery({
    queryKey: queryKeys.chat.messages(bookingId, params?.cursor),
    queryFn: () => api.chatApi.getMessages(bookingId, params),
    enabled: Boolean(bookingId),
    ...options
  });
};

export const useLogin = (
  options?: UseMutationOptions<AuthSession, unknown, { phone_number: string; password: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { phone_number: string; password: string }) => {
      const session = await api.authApi.login(input);
      await api.session.setTokens(session.tokens);
      return session;
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options
  });
};

export const useLogout = (
  options?: UseMutationOptions<Record<string, unknown>, unknown, void>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await api.authApi.logout();
      await api.session.clear();
      return result;
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      queryClient.clear();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options
  });
};

export const useCreateBooking = (
  options?: UseMutationOptions<Record<string, unknown>, unknown, { input: BookingCreateInput; idempotencyKey?: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, idempotencyKey }: { input: BookingCreateInput; idempotencyKey?: string }) =>
      api.bookingApi.create(input, idempotencyKey),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.active });
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options
  });
};

export const useEstimateFare = (
  options?: UseMutationOptions<Record<string, unknown>, unknown, BookingEstimateInput>
) => {
  const api = useApiClient();

  return useMutation({
    mutationFn: (input: BookingEstimateInput) => api.bookingApi.estimate(input),
    ...options
  });
};

export const useUpdateDriverLocation = (
  options?: UseMutationOptions<Record<string, unknown>, unknown, DriverLocationUpdateInput>
) => {
  const api = useApiClient();

  return useMutation({
    mutationFn: (input: DriverLocationUpdateInput) => api.driverApi.updateLocation(input),
    ...options
  });
};

export const useSendChatMessage = (
  bookingId: string,
  options?: UseMutationOptions<Record<string, unknown>, unknown, { text: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { text: string }) => api.chatApi.sendMessage(bookingId, input),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(bookingId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options
  });
};

export const useUpdateNotificationPreferences = (
  options?: UseMutationOptions<Record<string, unknown>, unknown, Record<string, unknown>>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api.usersApi.updateNotificationPreferences(input),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.notificationPreferences });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options
  });
};
