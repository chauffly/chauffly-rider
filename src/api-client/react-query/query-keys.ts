import { BookingTab } from '../types';

export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const
  },
  users: {
    me: ['users', 'me'] as const,
    addresses: ['users', 'me', 'addresses'] as const,
    notifications: (cursor?: string) => ['users', 'me', 'notifications', cursor ?? 'first'] as const,
    notificationPreferences: ['users', 'me', 'notification-preferences'] as const,
    sessions: ['users', 'me', 'sessions'] as const
  },
  bookings: {
    active: ['bookings', 'active'] as const,
    list: (tab?: BookingTab, cursor?: string) => ['bookings', 'list', tab ?? 'all', cursor ?? 'first'] as const,
    detail: (bookingId: string) => ['bookings', 'detail', bookingId] as const,
    estimate: ['bookings', 'estimate'] as const
  },
  rideOptions: {
    all: ['ride-options', 'all'] as const,
    detail: (id: string) => ['ride-options', id] as const
  },
  drivers: {
    me: ['drivers', 'me'] as const,
    vehicle: ['drivers', 'me', 'vehicle'] as const,
    documents: ['drivers', 'me', 'documents'] as const,
    earnings: (period: string) => ['drivers', 'me', 'earnings', period] as const,
    earningsSummary: ['drivers', 'me', 'earnings-summary'] as const,
    nearby: (key: string) => ['drivers', 'nearby', key] as const
  },
  chat: {
    messages: (bookingId: string, cursor?: string) => ['chat', 'messages', bookingId, cursor ?? 'first'] as const,
    quickReplies: (locale?: string) => ['chat', 'quick-replies', locale ?? 'default'] as const
  },
  wallet: {
    balance: ['wallet', 'balance'] as const,
    transactions: (cursor?: string, type?: string) =>
      ['wallet', 'transactions', cursor ?? 'first', type ?? 'all'] as const,
    paymentMethods: ['wallet', 'payment-methods'] as const
  },
  corporate: {
    organization: ['corporate', 'organization'] as const,
    employees: ['corporate', 'employees'] as const,
    summary: (period: string) => ['corporate', 'summary', period] as const,
    invoices: ['corporate', 'invoices'] as const,
    policies: ['corporate', 'travel-policies'] as const
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    users: ['admin', 'users'] as const,
    drivers: ['admin', 'drivers'] as const,
    bookings: ['admin', 'bookings'] as const,
    vehicles: ['admin', 'vehicles'] as const,
    settings: ['admin', 'settings'] as const
  }
};
