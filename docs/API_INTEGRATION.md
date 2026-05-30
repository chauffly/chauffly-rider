# Rider API Integration

Shared client source:

- `/Users/thecodingchef/Documents/projects/chauffly/rider/src/api-client`
- Main guide: `./API_CLIENT_GUIDE.md`
- Rider endpoint coverage: `./RIDER_ENDPOINT_COVERAGE.md`

Rider migration order:

1. Auth/session + `ChaufflyApiProvider`
2. `useCurrentUser`, `useRideOptions`, `useActiveBooking`
3. Booking estimate/create/list/history tabs
4. Rides socket events + driver location updates
5. Chat history + live socket chat
6. Wallet top-up + payment methods + balance refresh
7. Saved addresses CRUD + notification preferences
