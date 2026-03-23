import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

import { useApiClient } from './provider';
import { queryKeys } from './query-keys';
import type {
  AuthSession,
  BookingCreateInput,
  BookingEstimateInput,
  BookingTab,
  PaginatedResponse,
  WalletTopUpInput
} from '../types';
import type { BookingActionResponse } from '../apis/bookings-api';
import type { SavedAddressInput } from '../apis/users-api';
import type { PaymentMethodInput, WalletTransactionsQuery } from '../apis/wallet-api';

type UnknownRecord = Record<string, unknown>;

export const useCurrentUser = (
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => api.usersApi.getCurrentUser(),
    ...options
  });
};

export const useUpdateCurrentUser = (
  options?: UseMutationOptions<UnknownRecord, unknown, UnknownRecord>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UnknownRecord) => api.usersApi.updateCurrentUser(input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useUploadAvatar = (
  options?: UseMutationOptions<UnknownRecord, unknown, FormData>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => api.usersApi.uploadAvatar(formData),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useDeleteCurrentUser = (
  options?: UseMutationOptions<{ message: string }, unknown, void>
) => {
  const api = useApiClient();
  return useMutation({
    mutationFn: () => api.usersApi.deleteCurrentUser(),
    ...options
  });
};

export const useSavedAddresses = (
  options?: Omit<UseQueryOptions<Array<UnknownRecord>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.users.addresses,
    queryFn: () => api.usersApi.listAddresses(),
    ...options
  });
};

export const useCreateSavedAddress = (
  options?: UseMutationOptions<UnknownRecord, unknown, SavedAddressInput>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.usersApi.createAddress(input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.addresses });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useUpdateSavedAddress = (
  options?: UseMutationOptions<UnknownRecord, unknown, { id: string; input: Partial<SavedAddressInput> }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => api.usersApi.updateAddress(id, input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.addresses });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useDeleteSavedAddress = (
  options?: UseMutationOptions<{ message: string }, unknown, { id: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.usersApi.deleteAddress(id),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.addresses });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useToggleSavedAddressPin = (
  options?: UseMutationOptions<UnknownRecord, unknown, { id: string; pinned?: boolean }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }) => api.usersApi.toggleAddressPin(id, pinned),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.addresses });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useNotifications = (
  params?: { cursor?: string; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UnknownRecord>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.users.notifications(params?.cursor),
    queryFn: () => api.usersApi.listNotifications(params),
    ...options
  });
};

export const useMarkNotificationRead = (
  options?: UseMutationOptions<UnknownRecord, unknown, { id: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.usersApi.markNotificationRead(id),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.notifications() });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useMarkAllNotificationsRead = (
  options?: UseMutationOptions<{ updated: number }, unknown, void>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.usersApi.markAllNotificationsRead(),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.notifications() });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useNotificationPreferences = (
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.users.notificationPreferences,
    queryFn: () => api.usersApi.getNotificationPreferences(),
    ...options
  });
};

export const useUpdateNotificationPreferences = (
  options?: UseMutationOptions<UnknownRecord, unknown, UnknownRecord>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UnknownRecord) => api.usersApi.updateNotificationPreferences(input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.notificationPreferences });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useChangePassword = (
  options?: UseMutationOptions<{ message: string }, unknown, { current_password: string; new_password: string }>
) => {
  const api = useApiClient();
  return useMutation({
    mutationFn: (input) => api.usersApi.changePassword(input),
    ...options
  });
};

export const useUserSessions = (
  params?: { cursor?: string; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UnknownRecord>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [...queryKeys.users.sessions, params?.cursor ?? 'first'],
    queryFn: () => api.usersApi.listSessions(params),
    ...options
  });
};

export const useRevokeSession = (
  options?: UseMutationOptions<{ message: string }, unknown, { id: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.usersApi.revokeSession(id),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useRideOptions = (
  options?: Omit<UseQueryOptions<Array<UnknownRecord>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.rideOptions.all,
    queryFn: () => api.rideOptionsApi.list(),
    ...options
  });
};

export const useRideOptionById = (
  id: string,
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.rideOptions.detail(id),
    queryFn: () => api.rideOptionsApi.getById(id),
    enabled: Boolean(id),
    ...options
  });
};

export const useActiveBooking = (
  options?: Omit<UseQueryOptions<UnknownRecord | null>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.bookings.active,
    queryFn: () => api.bookingApi.getActive(),
    ...options
  });
};

export const useBookingById = (
  bookingId: string,
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => api.bookingApi.getById(bookingId),
    enabled: Boolean(bookingId),
    ...options
  });
};

export const useBookings = (
  params?: { tab?: BookingTab; cursor?: string; limit?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<UnknownRecord>>,
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

export const useCreateBooking = (
  options?: UseMutationOptions<UnknownRecord, unknown, { input: BookingCreateInput; idempotencyKey?: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, idempotencyKey }) => api.bookingApi.create(input, idempotencyKey),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.active });
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list() });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useEstimateFare = (
  options?: UseMutationOptions<UnknownRecord, unknown, BookingEstimateInput>
) => {
  const api = useApiClient();
  return useMutation({
    mutationFn: (input) => api.bookingApi.estimate(input),
    ...options
  });
};

export const useBookingCancel = (
  options?: UseMutationOptions<BookingActionResponse, unknown, { bookingId: string; reason: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }) => api.bookingApi.cancel(bookingId, { reason }),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.active });
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.list() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.bookingId) });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useBookingRate = (
  options?: UseMutationOptions<UnknownRecord, unknown, { bookingId: string; rating: number; comment?: string }>
) => {
  const api = useApiClient();
  return useMutation({
    mutationFn: ({ bookingId, rating, comment }) => api.bookingApi.rate(bookingId, { rating, comment }),
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

export const useWalletTransactions = (
  params?: WalletTransactionsQuery,
  options?: Omit<UseQueryOptions<PaginatedResponse<UnknownRecord>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.wallet.transactions(params?.cursor, params?.type),
    queryFn: () => api.walletApi.getTransactions(params),
    ...options
  });
};

export const useWalletTopUp = (
  options?: UseMutationOptions<{ authorization_url?: string; reference?: string }, unknown, WalletTopUpInput>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.walletApi.topUp(input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const usePaymentMethods = (
  options?: Omit<UseQueryOptions<Array<UnknownRecord>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.wallet.paymentMethods,
    queryFn: () => api.walletApi.listPaymentMethods(),
    ...options
  });
};

export const useAddPaymentMethod = (
  options?: UseMutationOptions<UnknownRecord, unknown, PaymentMethodInput>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.walletApi.addPaymentMethod(input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.paymentMethods });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useDeletePaymentMethod = (
  options?: UseMutationOptions<{ message: string }, unknown, { id: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.walletApi.deletePaymentMethod(id),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.paymentMethods });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useSetDefaultPaymentMethod = (
  options?: UseMutationOptions<UnknownRecord, unknown, { id: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.walletApi.setDefaultPaymentMethod(id),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.paymentMethods });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useChatMessages = (
  bookingId: string,
  params?: { cursor?: string; limit?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<UnknownRecord>>,
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

export const useChatQuickReplies = (
  locale?: string,
  options?: Omit<UseQueryOptions<Array<UnknownRecord>>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.chat.quickReplies(locale),
    queryFn: () => api.chatApi.getQuickReplies(locale),
    ...options
  });
};

export const useSendChatMessage = (
  bookingId: string,
  options?: UseMutationOptions<UnknownRecord, unknown, { text: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.chatApi.sendMessage(bookingId, input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(bookingId) });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useCorporateSummary = (
  period: 'today' | 'last_7_days' | 'last_30_days',
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.corporate.summary(period),
    queryFn: () => api.corporateApi.getSummary(period),
    ...options
  });
};

export const useCorporateOrganization = (
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.corporate.organization,
    queryFn: () => api.corporateApi.getOrganization(),
    ...options
  });
};

export const useCorporateEmployees = (
  params?: { status?: string; cursor?: string; limit?: number },
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [...queryKeys.corporate.employees, params?.status ?? 'all', params?.cursor ?? 'first'],
    queryFn: () => api.corporateApi.listEmployees(params),
    ...options
  });
};

export const useInviteCorporateEmployee = (
  options?: UseMutationOptions<UnknownRecord, unknown, { email: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => api.corporateApi.inviteEmployee(input),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.corporate.employees });
      await queryClient.invalidateQueries({ queryKey: queryKeys.corporate.joinRequests });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useRemoveCorporateEmployee = (
  options?: UseMutationOptions<UnknownRecord, unknown, { id: string }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.corporateApi.removeEmployee(id),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.corporate.employees });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useCorporateJoinRequests = (
  params?: { cursor?: string; limit?: number },
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [...queryKeys.corporate.joinRequests, params?.cursor ?? 'first'],
    queryFn: () => api.corporateApi.listJoinRequests(params),
    ...options
  });
};

export const useDecideCorporateJoinRequest = (
  options?: UseMutationOptions<UnknownRecord, unknown, { id: string; approved: boolean }>
) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved }) => api.corporateApi.decideJoinRequest(id, approved),
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.corporate.joinRequests });
      await queryClient.invalidateQueries({ queryKey: queryKeys.corporate.employees });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options
  });
};

export const useCorporateUsage = (
  params?: { cursor?: string; limit?: number },
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.corporate.usage(params?.cursor),
    queryFn: () => api.corporateApi.getUsage(params),
    ...options
  });
};

export const useCorporateInvoices = (
  params?: { cursor?: string; limit?: number },
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [...queryKeys.corporate.invoices, params?.cursor ?? 'first'],
    queryFn: () => api.corporateApi.listInvoices(params),
    ...options
  });
};

export const useCorporateInvoiceById = (
  id: string,
  options?: Omit<UseQueryOptions<UnknownRecord>, 'queryKey' | 'queryFn'>
) => {
  const api = useApiClient();
  return useQuery({
    queryKey: [...queryKeys.corporate.invoices, 'detail', id],
    queryFn: () => api.corporateApi.getInvoiceDetail(id),
    enabled: Boolean(id),
    ...options
  });
};

export const useJoinCompany = (
  options?: UseMutationOptions<UnknownRecord, unknown, { organization_code?: string; organization_name?: string }>
) => {
  const api = useApiClient();
  return useMutation({
    mutationFn: (input) => api.corporateApi.requestJoinCompany(input),
    ...options
  });
};

export const useReportIncident = (
  options?: UseMutationOptions<UnknownRecord, unknown, { type: 'fraud' | 'incident' | 'sos'; description: string; booking_id?: string }>
) => {
  const api = useApiClient();
  return useMutation({
    mutationFn: (input) => api.safetyApi.reportIncident(input as any),
    ...options
  });
};

export const useTriggerSos = (
  options?: UseMutationOptions<UnknownRecord, unknown, { description?: string; booking_id?: string; coordinates?: { lat: number; lng: number } }>
) => {
  const api = useApiClient();
  return useMutation({
    mutationFn: (input) => api.safetyApi.triggerSos(input),
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
