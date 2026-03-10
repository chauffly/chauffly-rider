# Chauffly Client Integration Guide

This guide explains how to migrate rider, driver, and admin clients from local mocks to the real Chauffly backend while keeping UI data shapes stable.

## 1) Base Configuration

### Environment variables

Use app-specific env files and keep base URL centralized.

- `API_BASE_URL=https://your-server-domain`
- `SOCKET_BASE_URL=https://your-server-domain`

For Expo apps, expose with `EXPO_PUBLIC_*` and read from `expo-constants`.

### Shared client bootstrap

Create one app-level singleton per app:

- `apiClient = createChaufflyApiClient(...)`
- `socketClient = new ChaufflySocketClient(...)`
- `<ChaufflyApiProvider ...>` around the app root.

## 2) API Coverage Matrix

The shared layer already includes typed modules for current backend routes.

- Auth: register, verify OTP, login, refresh, forgot/reset password, logout
- Users: profile, avatar upload, account delete, addresses, notifications, preferences, password, sessions
- Drivers: profile, status, location, documents, verification, vehicle, earnings, performance, nearby
- Bookings: estimate, create, active, list/detail, lifecycle actions, cancel, rate
- Ride options: public + admin CRUD/pricing
- Chat: quick replies, history, REST fallback send
- Wallet/Payments: top-up, balance, transactions, payment methods
- Corporate: org, employees, join requests, travel policy, summary/usage/invoices
- Admin: roles, dashboard, users, drivers, bookings, fleet, settings, profile, corporate, events, settlements
- Analytics: overview/revenue/trips/utilization/top-routes, reports, CSV exports
- Safety: incident report/SOS, admin incidents, KYC queue actions

## 3) React Query Hooks Ready to Use

Implemented hooks include:

- `useCurrentUser()`
- `useActiveBooking()`
- `useRideOptions()`
- `useDriverEarnings(period)`
- `useNearbyDrivers(input)`
- `useWalletBalance()`
- `useChatMessages(bookingId)`
- mutations: `useLogin`, `useLogout`, `useCreateBooking`, `useEstimateFare`, `useUpdateDriverLocation`, `useSendChatMessage`, `useUpdateNotificationPreferences`

Cache invalidation is already wired for key mutation paths.

## 4) WebSocket Integration

### Namespaces

- `/rides`
- `/chat`
- `/admin`

### Implemented wrappers/hooks

- `ChaufflySocketClient`
- `useSocketConnectionStatus(socketClient, namespace)`
- `useBookingUpdates(socketClient, handlers)`
- `useDriverLocation(socketClient)`
- `useChatMessages(socketClient, bookingId)`

### Login/Logout lifecycle

- Login success: store tokens, then `socketClient.connectAll()`
- Logout: `socketClient.disconnectAll()` then clear tokens

## 5) Rider App Checklist

1. Replace `localJsonApi` reads with hooks:
- Home/profile: `useCurrentUser`, `useWalletBalance`
- Ride options: `useRideOptions`
- Active booking widgets: `useActiveBooking`

2. Booking flow:
- estimate: `bookingApi.estimate`
- create: `useCreateBooking` with `Idempotency-Key`
- list/history tabs: `bookingApi.list({ tab })`

3. Live trip updates:
- `socketClient.connectRides()`
- use `useBookingUpdates` + `useDriverLocation`

4. Chat:
- history: `chatApi.getMessages(bookingId)`
- live: `useChatMessages(socketClient, bookingId)`
- fallback send: `chatApi.sendMessage`

5. Payment:
- top-up initialize: `walletApi.topUp`
- complete via Paystack WebView redirect flow
- refresh wallet: invalidate `queryKeys.wallet.balance`

6. Saved addresses:
- full CRUD from `usersApi` methods

7. Notification preferences:
- `usersApi.getNotificationPreferences` + `usersApi.updateNotificationPreferences`

8. Google Places:
- keep existing UI integration
- move API key to env and avoid hardcoded keys.

## 6) Driver App Checklist

1. Replace `localJsonApi` reads with real hooks/APIs.

2. Availability:
- online/offline: `driverApi.updateStatus({ is_online })`

3. Frequent location updates:
- call `driverApi.updateLocation`
- throttle client-side to <= 1 request per 3 seconds

4. Ride requests + lifecycle:
- listen for `new_ride_request`
- actions: `bookingApi.accept/decline/arrived/verifyPin/arriveStop/complete`

5. Earnings dashboard:
- `useDriverEarnings(period)`
- `driverApi.getEarningsSummary()`
- `driverApi.getPerformance()`

6. Chat:
- same `/chat` integration as rider

7. Document upload:
- `driverApi.uploadDocument(FormData)`
- status: `driverApi.getDocuments`, `driverApi.getVerificationStatus`

8. Vehicle management:
- `driverApi.registerVehicle`, `driverApi.updateVehicle`, `driverApi.getVehicle`

## 7) Admin Dashboard Checklist

1. Replace mocked page datasets with API modules:
- dashboard: `adminApi.getDashboard` + `/admin` socket stream
- users/drivers/bookings/fleet CRUD: `adminApi.*`

2. Analytics charts:
- `analyticsApi.overview/revenue/trips/driverUtilization/topRoutes`

3. Reports:
- generate: `analyticsApi.generateReport`
- download: `analyticsApi.downloadReport`

4. Corporate + events:
- `adminApi.listCorporateOrganizations`, `adminApi.generateCorporateInvoice`
- `adminApi.createEvent/listEvents/updateEvent/updateEventStatus`

5. Auth + 2FA:
- use server auth endpoints
- manage 2FA via `adminApi.toggleMyTwoFactor`

6. CSRF handling:
- if `csrfToken` is returned in token payload, client auto-sends `x-csrf-token` on non-GET requests.

### Admin page -> API mapping

| Admin page | Replace mock source with |
|---|---|
| Dashboard | `adminApi.getDashboard()`, socket event `dashboard_update` |
| Drivers | `adminApi.listDrivers()`, `adminApi.verifyDriver()`, `adminApi.suspendDriver()` |
| Users | `adminApi.listUsers()`, `adminApi.getUserById()`, `adminApi.suspendUser()/activateUser()` |
| Bookings | `adminApi.listBookings()`, `adminApi.assignDriverToBooking()`, `adminApi.cancelBooking()` |
| Fleet | `adminApi.listVehicles()`, `adminApi.createVehicle()`, `adminApi.assignVehicle()` |
| Payments | `walletApi.getTransactions()` + `adminApi.processSettlements()` |
| Corporate | `adminApi.listCorporateOrganizations()`, `adminApi.generateCorporateInvoice()` |
| Analytics | `analyticsApi.overview()/revenue()/trips()/driverUtilization()/topRoutes()` |
| Safety | `safetyApi.listIncidents()`, `safetyApi.listKycQueue()` |
| Settings | `adminApi.getSettings()`, `adminApi.updateSetting()`, `adminApi.updateNotificationRules()` |
| Profile | `adminApi.getMe()`, `adminApi.changeMyPassword()`, `adminApi.toggleMyTwoFactor()` |

## 8) localJsonApi Migration Table (Rider/Driver)

| localJsonApi method | Real API call / hook | Notes |
|---|---|---|
| `getCurrentUser()` | `useCurrentUser()` / `usersApi.getCurrentUser()` | includes profile + wallet from backend |
| `getCurrentUserRole()` | `useCurrentUser().data.role` | role from auth/user payload |
| `getPrimaryDriver()` | `useActiveBooking()` -> `booking.driver` | derive from active booking |
| `getDriverById(id)` | `bookingApi.getById(id)` (booking context) or `adminApi.getDriverById(id)` (admin only) | rider/driver scope is booking-bound |
| `getRideOptions()` | `useRideOptions()` | map tier -> local image asset |
| `getActiveBooking()` | `useActiveBooking()` | same semantics |
| `getRideTabs()` | static local constant | backend filters by `tab` |
| `getRidesByTab(tab)` | `bookingApi.list({ tab })` | use tab mapping `canceled -> cancelled` |
| `getSavedAddresses()` | `usersApi.listAddresses()` | full CRUD also available |
| `getChatMessages(bookingId)` | `chatApi.getMessages(bookingId)` + socket `new_message` | cursor pagination supported |
| `getAuthDefaults()` | local form defaults | keep local, do not call backend |
| `getUiDefaults()` | local UI constants | keep local, do not call backend |
| `getCorporateSummary(period)` | `corporateApi.getSummary(period)` | real analytics |
| `getCorporateUsageOverview(period)` | `corporateApi.getUsage(...)` | adapt chart shape client-side |
| `getCorporateUsersData()` | `corporateApi.listEmployees()` + `corporateApi.listJoinRequests()` | merge in view-model |
| `getCorporateInvoices()` | `corporateApi.listInvoices()` | paginated |
| `getCorporateInvoiceById(id)` | `corporateApi.getInvoiceDetail(id)` | includes ride breakdown |

## 9) Shape-Preserving Strategy

To migrate screen-by-screen without rewriting all UI selectors at once:

1. Use `createLocalJsonApiAdapter(apiClient)` from `src/compat/local-json-api-adapter.ts`.
2. Keep existing view model names in selectors.
3. Move each screen from sync mock read -> async hook call.
4. Remove the adapter after all screens consume direct API hooks.

## 10) Suggested Rollout Order

1. Auth + session persistence
2. Current user + ride options + active booking
3. Booking create + lifecycle + websocket ride events
4. Chat history + live chat
5. Wallet + payment methods + top-up
6. Corporate screens
7. Driver documents/vehicle/earnings
8. Admin dashboard + analytics + reports

## 11) Future Endpoints

For any new server endpoint:

1. Add typed method under `src/apis/*`
2. Add query key in `src/react-query/query-keys.ts`
3. Add hook/mutation in `src/react-query/hooks.ts`
4. Add websocket event type (if applicable) in `src/websocket/events.ts`
5. Update this guide mapping table
