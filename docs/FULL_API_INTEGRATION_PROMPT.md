# Rider App: Full API Integration Prompt

Use this exact prompt with Codex/ChatGPT to fully wire the Rider app to the Chauffly backend.

```md
You are a senior React Native + Expo engineer. Integrate the Rider app with the real Chauffly backend and remove any remaining mock/localJsonApi dependency for production paths.

Repository:
- /Users/thecodingchef/Documents/projects/chauffly/rider

Backend base:
- /api/v1
- WebSocket namespaces: /rides, /chat

Goals:
1. Make the Rider app fully functional with real APIs and live socket updates.
2. Keep current UI screens and data shapes stable where possible.
3. Ensure robust auth/session handling, retries, and graceful offline/network behavior.
4. Keep code TypeScript-safe and production ready.

Environment setup:
1. Read from Expo public env vars:
   - EXPO_PUBLIC_API_BASE_URL
   - EXPO_PUBLIC_API_PREFIX
   - EXPO_PUBLIC_SOCKET_BASE_URL
   - EXPO_PUBLIC_SOCKET_PATH
   - EXPO_PUBLIC_REQUEST_TIMEOUT_MS
   - EXPO_PUBLIC_ENABLE_API_LOGS
   - EXPO_PUBLIC_ENABLE_SOCKET_DEBUG
   - EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
   - EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY
2. Create/update a central env config module and stop hardcoding URLs/keys.

Mandatory endpoint integration (Rider scope):

Auth:
- POST /auth/register
- POST /auth/verify-otp
- POST /auth/login
- POST /auth/refresh
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/logout

User/Profile:
- GET /users/me
- PUT /users/me
- PUT /users/me/avatar
- DELETE /users/me
- PUT /users/me/security/password
- GET /users/me/sessions
- DELETE /users/me/sessions/:id

Saved Addresses:
- GET /users/me/addresses
- POST /users/me/addresses
- PUT /users/me/addresses/:id
- DELETE /users/me/addresses/:id
- PATCH /users/me/addresses/:id/pin

Notifications:
- GET /users/me/notifications
- PATCH /users/me/notifications/:id/read
- PATCH /users/me/notifications/read-all
- GET /users/me/notification-preferences
- PUT /users/me/notification-preferences

Ride options + booking:
- GET /ride-options
- GET /ride-options/:id
- POST /bookings/estimate
- POST /bookings (with Idempotency-Key support)
- GET /bookings/active
- GET /bookings
- GET /bookings/:id
- POST /bookings/:id/cancel
- POST /bookings/:id/rate

Booking real-time and lifecycle events Rider must consume:
- driver_assigned
- driver_location_update
- driver_arrived
- trip_started
- trip_completed
- booking_status_changed
- no_drivers_available
- ride_cancelled

Chat:
- GET /chat/quick-replies
- GET /chat/:bookingId/messages
- POST /chat/:bookingId/messages
- Socket events for join_thread, send_message, new_message, message_read, typing

Wallet/Payments:
- POST /wallet/top-up
- GET /wallet/balance
- GET /wallet/transactions
- POST /wallet/payment-methods
- GET /wallet/payment-methods
- DELETE /wallet/payment-methods/:id
- PATCH /wallet/payment-methods/:id/default

Corporate rider features:
- POST /riders/me/join-company
- GET /corporate/summary
- GET /corporate/usage
- GET /corporate/invoices
- GET /corporate/invoices/:id

Safety:
- POST /incidents
- POST /sos

Implementation requirements:
1. Use the existing shared API client under src/api-client.
2. Wrap app root with ChaufflyApiProvider and QueryClient.
3. Persist tokens securely and auto-refresh on 401; queue requests during refresh.
4. Connect sockets on login/verify success; disconnect on logout/session invalidation.
5. Replace localJsonApi calls screen-by-screen using hooks or typed client methods.
6. Keep pagination cursor-based where supported.
7. Implement optimistic UI only where safe; otherwise invalidate React Query caches.
8. Preserve all existing UX states: loading, empty, error, retry.
9. Never log passwords, OTPs, tokens, or card data.

Future endpoint support (required):
1. Create/update docs listing endpoint-to-client mapping for Rider.
2. Add a clear "how to add a new endpoint" section:
   - add typed method in src/api-client/apis/*
   - add query key
   - add hook/mutation
   - add socket event type if needed
3. Ensure new endpoints can be integrated without breaking existing shape contracts.

Acceptance criteria:
1. Rider can register, verify OTP, login, refresh, logout.
2. Rider can estimate fare, create booking, track active ride live, cancel/rate ride.
3. Chat works via socket and REST fallback.
4. Wallet top-up and payment-method flows are wired.
5. Saved addresses and notification preferences are wired.
6. No localJsonApi dependency in production code paths.
7. TypeScript passes for modified files.

Output format:
1. Summary of what was changed.
2. File-by-file list.
3. Any remaining blockers/TODOs.
4. Exact manual QA steps for auth, booking, chat, and wallet flows.
```
