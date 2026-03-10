export type SocketNamespace = 'rides' | 'chat' | 'admin';

export interface RidesServerToClientEvents {
  new_ride_request: (payload: {
    booking: Record<string, unknown>;
    pickup: Record<string, unknown>;
    destination?: Record<string, unknown> | null;
    fare?: Record<string, unknown> | null;
    timer: number;
    attempt: number;
  }) => void;
  ride_cancelled: (payload: { bookingId: string; reason?: string | null }) => void;
  ride_timeout: (payload: { bookingId: string }) => void;
  driver_assigned: (payload: {
    driver: Record<string, unknown> | null;
    vehicle: Record<string, unknown> | null;
    eta?: number | null;
  }) => void;
  driver_location_update: (payload: {
    lat: number;
    lng: number;
    heading?: number | null;
    eta_seconds?: number | null;
  }) => void;
  driver_arrived: (payload: { pin?: string | null }) => void;
  trip_started: (payload: { bookingId: string }) => void;
  trip_completed: (payload: { fare_breakdown?: Record<string, unknown>; earnings?: Record<string, unknown> }) => void;
  booking_status_changed: (payload: {
    bookingId: string;
    status: string;
    metadata?: Record<string, unknown>;
  }) => void;
  no_drivers_available: (payload: { bookingId: string }) => void;
  location_update_ack: (payload: { recorded_at: string }) => void;
  ride_response: (payload: { bookingId: string; accepted: boolean; status: string }) => void;
  heartbeat_ack: (payload: { server_time: string }) => void;
  validation_error: (payload: { event: string; message: string }) => void;
  rate_limited: (payload: { event: string; retry_after_ms: number }) => void;
  event_error: (payload: { event: string; message: string; statusCode: number }) => void;
}

export interface RidesClientToServerEvents {
  heartbeat: () => void;
  location_update: (payload: { lat: number; lng: number; heading?: number; speed?: number }) => void;
  accept_ride: (payload: { bookingId: string }) => void;
  decline_ride: (payload: { bookingId: string; reason?: string }) => void;
}

export interface ChatServerToClientEvents {
  thread_joined: (payload: { bookingId: string; threadId: string; unread_count: number }) => void;
  new_message: (payload: {
    id: string;
    bookingId: string;
    threadId: string;
    senderId: string;
    senderType: 'rider' | 'driver';
    text: string;
    isRead: boolean;
    createdAt: string;
  }) => void;
  message_read: (payload: { messageId: string; readBy: string }) => void;
  typing: (payload: { bookingId: string; userId: string; isTyping: boolean }) => void;
  heartbeat_ack: (payload: { server_time: string }) => void;
  validation_error: (payload: { event: string; message: string }) => void;
  rate_limited: (payload: { event: string; retry_after_ms: number }) => void;
  event_error: (payload: { event: string; message: string; statusCode: number }) => void;
}

export interface ChatClientToServerEvents {
  heartbeat: () => void;
  join_thread: (payload: { bookingId: string }) => void;
  send_message: (payload: { bookingId: string; text: string }) => void;
  message_read: (payload: { messageId: string }) => void;
  typing: (payload: { bookingId: string; isTyping: boolean }) => void;
}

export interface AdminServerToClientEvents {
  dashboard_update: (payload: {
    timestamp: string;
    metrics: Record<string, number>;
  }) => void;
  new_alert: (payload: Record<string, unknown>) => void;
  booking_update: (payload: { bookingId: string; status: string; metadata?: Record<string, unknown> }) => void;
  driver_status_change: (payload: Record<string, unknown>) => void;
  heartbeat_ack: (payload: { server_time: string }) => void;
}

export interface AdminClientToServerEvents {
  heartbeat: () => void;
}

export interface NamespaceConnectionState {
  namespace: SocketNamespace;
  connected: boolean;
  connecting: boolean;
  lastConnectedAt: string | null;
  reconnectAttempts: number;
  lastError: string | null;
}
