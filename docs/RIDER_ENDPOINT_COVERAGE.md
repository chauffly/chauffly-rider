# Rider Endpoint Coverage

This document maps Rider app screens/features to typed API methods and React Query hooks.

## Environment + Runtime

- Env module: `src/config/env.ts`
- Runtime bootstrap: `src/runtime/rider-runtime.ts`
- Runtime provider: `src/runtime/rider-runtime-provider.tsx`
- App root wrapper: `src/app/_layout.tsx`

## Endpoint Mapping

### Auth

| Endpoint | Typed method | App integration |
|---|---|---|
| `POST /auth/register` | `authApi.register` | `src/app/(auth)/register.tsx` |
| `POST /auth/verify-otp` | `authApi.verifyOtp` | `src/app/(auth)/verify-otp.tsx` |
| `POST /auth/login` | `authApi.login`, `useLogin` | `src/app/(auth)/login.tsx` |
| `POST /auth/refresh` | automatic via axios interceptor | `src/api-client/http.ts` |
| `POST /auth/forgot-password` | `authApi.forgotPassword` | `src/app/(auth)/forgot-password.tsx` |
| `POST /auth/reset-password` | `authApi.resetPassword` | `src/app/(auth)/create-new-password.tsx` |
| `POST /auth/logout` | `authApi.logout`, `useLogout` | `src/app/(tabs)/account.tsx` |

### User/Profile

| Endpoint | Typed method | Hook / screen |
|---|---|---|
| `GET /users/me` | `usersApi.getCurrentUser` | `useCurrentUser`, account + home tabs |
| `PUT /users/me` | `usersApi.updateCurrentUser` | `useUpdateCurrentUser`, `account/personal-info.tsx` |
| `PUT /users/me/avatar` | `usersApi.uploadAvatar` | `useUploadAvatar`, `account/personal-info.tsx` |
| `DELETE /users/me` | `usersApi.deleteCurrentUser` | `useDeleteCurrentUser`, `account/security.tsx` |
| `PUT /users/me/security/password` | `usersApi.changePassword` | `useChangePassword`, `account/security.tsx` |
| `GET /users/me/sessions` | `usersApi.listSessions` | `useUserSessions`, `account/security.tsx` |
| `DELETE /users/me/sessions/:id` | `usersApi.revokeSession` | `useRevokeSession`, `account/security.tsx` |

### Saved Addresses

| Endpoint | Typed method | Hook / screen |
|---|---|---|
| `GET /users/me/addresses` | `usersApi.listAddresses` | `useSavedAddresses`, `account/saved-addresses.tsx` |
| `POST /users/me/addresses` | `usersApi.createAddress` | `useCreateSavedAddress`, `account/saved-addresses.tsx` |
| `PUT /users/me/addresses/:id` | `usersApi.updateAddress` | `useUpdateSavedAddress`, `account/saved-addresses.tsx` |
| `DELETE /users/me/addresses/:id` | `usersApi.deleteAddress` | `useDeleteSavedAddress`, `account/saved-addresses.tsx` |
| `PATCH /users/me/addresses/:id/pin` | `usersApi.toggleAddressPin` | `useToggleSavedAddressPin`, `account/saved-addresses.tsx` |

### Notifications

| Endpoint | Typed method | Hook / screen |
|---|---|---|
| `GET /users/me/notifications` | `usersApi.listNotifications` | `useNotifications`, `account/notification-list.tsx` |
| `PATCH /users/me/notifications/:id/read` | `usersApi.markNotificationRead` | `useMarkNotificationRead`, `account/notification-list.tsx` |
| `PATCH /users/me/notifications/read-all` | `usersApi.markAllNotificationsRead` | `useMarkAllNotificationsRead`, `account/notifications.tsx` |
| `GET /users/me/notification-preferences` | `usersApi.getNotificationPreferences` | `useNotificationPreferences`, `account/notifications.tsx` |
| `PUT /users/me/notification-preferences` | `usersApi.updateNotificationPreferences` | `useUpdateNotificationPreferences`, `account/notifications.tsx` |

### Ride Options + Bookings

| Endpoint | Typed method | Hook / screen |
|---|---|---|
| `GET /ride-options` | `rideOptionsApi.list` | `useRideOptions`, `app/(tabs)/index.tsx` |
| `GET /ride-options/:id` | `rideOptionsApi.getById` | `useRideOptionById` (available) |
| `POST /bookings/estimate` | `bookingApi.estimate` | `useEstimateFare`, `booking/ride-summary.tsx` |
| `POST /bookings` | `bookingApi.create` | `useCreateBooking`, `booking/ride-summary.tsx` |
| `GET /bookings/active` | `bookingApi.getActive` | `useActiveBooking` |
| `GET /bookings` | `bookingApi.list` | `useBookings`, `app/(tabs)/rides.tsx` |
| `GET /bookings/:id` | `bookingApi.getById` | `useBookingById`, ride lifecycle/detail screens |
| `POST /bookings/:id/cancel` | `bookingApi.cancel` | `useBookingCancel`, booking detail/lifecycle |
| `POST /bookings/:id/rate` | `bookingApi.rate` | `useBookingRate`, `booking/rate-driver.tsx` |

### Booking Socket Events (`/rides`)

| Event | Consumer |
|---|---|
| `driver_assigned` | `src/runtime/rider-runtime.ts`, `booking/driver-accepts.tsx` |
| `driver_location_update` | `useDriverLocation(socketClient)` in rider booking screens |
| `driver_arrived` | `booking/driver-accepts.tsx` |
| `trip_started` | `booking/driver-accepts.tsx` / status updates |
| `trip_completed` | `booking/driver-accepts.tsx`, `booking/heading-destination.tsx` |
| `booking_status_changed` | `useBookingUpdates(socketClient, ...)` |
| `no_drivers_available` | runtime invalidation + booking status handling |
| `ride_cancelled` | rider booking lifecycle screens |

### Chat

| Endpoint/Event | Typed method/hook | Screen |
|---|---|---|
| `GET /chat/quick-replies` | `chatApi.getQuickReplies`, `useChatQuickReplies` | `booking/message-driver.tsx` |
| `GET /chat/:bookingId/messages` | `chatApi.getMessages`, `useChatMessages` | `booking/message-driver.tsx` |
| `POST /chat/:bookingId/messages` | `chatApi.sendMessage`, `useSendChatMessage` | `booking/message-driver.tsx` |
| `join_thread`, `send_message`, `new_message`, `message_read`, `typing` | `socketClient.chat.*`, `useChatMessagesSocket` | `booking/message-driver.tsx` |

### Wallet/Payments

| Endpoint | Typed method | Hook / screen |
|---|---|---|
| `POST /wallet/top-up` | `walletApi.topUp` | `useWalletTopUp`, `account/top-up.tsx` |
| `GET /wallet/balance` | `walletApi.getBalance` | `useWalletBalance`, account tab + top-up |
| `GET /wallet/transactions` | `walletApi.getTransactions` | `useWalletTransactions` |
| `POST /wallet/payment-methods` | `walletApi.addPaymentMethod` | `useAddPaymentMethod`, `account/top-up.tsx` |
| `GET /wallet/payment-methods` | `walletApi.listPaymentMethods` | `usePaymentMethods`, `account/top-up.tsx` |
| `DELETE /wallet/payment-methods/:id` | `walletApi.deletePaymentMethod` | `useDeletePaymentMethod`, `account/top-up.tsx` |
| `PATCH /wallet/payment-methods/:id/default` | `walletApi.setDefaultPaymentMethod` | `useSetDefaultPaymentMethod`, `account/top-up.tsx` |

### Corporate Rider

| Endpoint | Typed method | Hook / screen |
|---|---|---|
| `POST /riders/me/join-company` | `corporateApi.requestJoinCompany` | `useJoinCompany`, `account/join-company.tsx` |
| `GET /corporate/summary` | `corporateApi.getSummary` | `useCorporateSummary`, `components/home/corporate-dashboard-content.tsx` |
| `GET /corporate/usage` | `corporateApi.getUsage` | `useCorporateUsage`, `components/home/corporate-dashboard-content.tsx` |
| `GET /corporate/invoices` | `corporateApi.listInvoices` | `useCorporateInvoices`, `app/(tabs)/billing-invoice.tsx` |
| `GET /corporate/invoices/:id` | `corporateApi.getInvoiceDetail` | `useCorporateInvoiceById`, `corporate/invoice-details.tsx` |

### Safety

| Endpoint | Typed method | Hook |
|---|---|---|
| `POST /incidents` | `safetyApi.reportIncident` | `useReportIncident` |
| `POST /sos` | `safetyApi.triggerSos` | `useTriggerSos` |

## New Endpoint Onboarding Checklist

1. Add typed request/response in `src/api-client/types.ts` or specific API module.
2. Add API method in `src/api-client/apis/*.ts`.
3. Export it through `src/api-client/apis/index.ts` if needed.
4. Add query key in `src/api-client/react-query/query-keys.ts`.
5. Add hook/mutation in `src/api-client/react-query/hooks.ts`.
6. Integrate into the target screen/component and preserve current view-model shape (use adapter mapping if backend fields differ).
7. If real-time, add socket event type/handler in:
   - `src/api-client/websocket/events.ts`
   - `src/api-client/websocket/hooks.ts`
   - screen-level listeners.
8. Add cache invalidation for related query keys on mutation success.
9. Update this coverage file with endpoint -> method -> screen mapping.
10. Run `npx tsc --noEmit` and app smoke test for loading/error/empty states.
